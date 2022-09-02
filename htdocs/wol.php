<?php
include_once(__DIR__.'/../lib/core.php');
//defin展開用
$_const = function($s){return $s;};

if(isset($_SERVER['REQUEST_METHOD'])){
 if(!empty($_GET)){
  $params = array(
   'mac_addr' => isset($_GET['mac']) ? $_GET['mac'] : null,
   'sw' => isset($_GET['sw']) ? $_GET['sw'] : null,
   'ip' => isset($_GET['ip']) ? $_GET['ip'] : null,
   'wait' => isset($_GET['wait']) ? (int)$_GET['wait'] : 1,
   'loop' => isset($_GET['loop']) ? (int)$_GET['loop'] : 1,
   'interval' => isset($_GET['interval']) ? (int)$_GET['interval'] : 1,
   'duration' => isset($_GET['duration']) ? (int)$_GET['duration'] : 1,
  );
  if((empty($params['mac_addr']) && empty($params['sw'])) || $params['loop'] > 10) errRes(400);
  if(!empty($params['mac_addr']) && !empty($params['sw'])) errRes(400);
  if(!empty($params['sw'])){
   if(strlen($params['sw']) <> 1 || $params['sw'] < 1 || $params['sw'] > 4) errRes(400);
  }
  addWOL($params);
 }else{
  errRes(500);
 }
}elseif($argc == 3){
 $mac_addr = $argv[1];
 $wait = $argv[2];
 WOL_loop($mac_addr, $wait);
}else{
 die('Error');
}

function addWOL($params){
 $params['mac_addr'] = empty($params['mac_addr']) ? $params['sw'] : $params['mac_addr'];
 unset($params['sw']);
 $sql_chk = "SELECT mac_addr FROM wol_t WHERE mac_addr = ?";
 $result_chk = execSql($sql_chk, array($params['mac_addr']));
 if(count($result_chk) <> 0) errRes(409);
 $sql = "INSERT INTO wol_t (mac_addr,ip,wait,loop,interval,duration) VALUES (:mac_addr,:ip,:wait,:loop,:interval,:duration)";
 $result = execSql($sql, $params);
 $cmd = "nohup php wol.php {$params['mac_addr']} {$params['wait']} > /dev/null & echo $!";
 exec($cmd, $output);
 $pid = $output[0];
 $sql_update = "UPDATE wol_t SET pid = ? WHERE mac_addr = ?";
 $result_update = execSql($sql_update, array($pid, $params['mac_addr']));
}

function WOL_loop($mac_addr, $wait, $count = 0, $ploop = 0){
 $sw = false;
 $sql = "SELECT loop,interval,ip,duration,pid FROM wol_t WHERE mac_addr = ?";
 $result = execSql($sql, array($mac_addr));
 if(count($result) == 0) exit;
 $loop = $result[0]['loop'];
 $interval = $result[0]['interval'];
 $ip = $result[0]['ip'];
 $duration = $result[0]['duration'];
 $pid = $result[0]['pid'];
 $mypid = getmypid();
 if($mypid <> $pid) exit;
 if(strlen($mac_addr) == 1 && $mac_addr >= 1 && $mac_addr <= 4){
  $sw = true;
  $loop = 1;
 }
 sleep($wait);
 if($count == 0 && !empty($ip)){
  if(execPing($ip)) $count -= 1;
 }
 if($count >= 0) {
  if($sw){
   execSW($mac_addr, $duration);
  }else{
   if(!execWOL($mac_addr)){
    endJOB($mac_addr);
   }
  }
 }
 $count += 1;
 $ploop += 1;
 if($loop <= $count || 100 <= $ploop){
  endJOB($mac_addr);
 }else{
  WOL_loop($mac_addr, $interval, $count, $ploop);
 }
}

function execWOL($mac){
 $hw = pack('H*', preg_replace('/[^0-9a-fA-F]/', '', $mac));
 $pkt = sprintf('%s%s', str_repeat(chr(255), 6), str_repeat($hw, 16));
 $sock = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);
 if($sock !== false){
  $opt = socket_set_option($sock, SOL_SOCKET, SO_BROADCAST, true);
  if($opt !== false){
   socket_sendto($sock, $pkt, strlen($pkt), 0, '255.255.255.255', 9);
   socket_close($sock);
   return true;
  }
 }
 return false;
}

function execPing($ip){
 if(empty($ip)) return Null;
 $cmd = "ping -c 1 -W 1 -q {$ip}";
 exec($cmd, $out, $res);
 if($res){
  return false;
 }else{
  return true;
 }
}

function endJOB($mac_addr){
 $sql_del = "DELETE FROM wol_t WHERE mac_addr = ?";
 $result_del = execSql($sql_del, array($mac_addr));
 exit;
}

function execSW($sw, $duration){
  global $_const;
  $p = "-a PULSE -s ON -d {$duration} -r {$sw}";
  $cmd = "python3 {$_const(PROGRAM_DIR)}/ks0212.py {$p}";
  exec($cmd, $out, $ret);
  if($ret){
   endJOB($sw);
  }
}
