<?php
include_once(__DIR__.'/../lib/core.php');
//defin展開用
$_const = function($s){return $s;};

$head_info = getallheaders();
//var_dump($head_info);
$sid = isset($head_info['SID']) ? $head_info['SID'] : Null;
$cmd = isset($_POST['cmd']) ? $_POST['cmd'] : Null;
$param = isset($_POST['params']) ? json_decode($_POST['params'], true) : Null;

$res_data = array();
switch($cmd){
 case 'login':
  $data = login();
  break;
 case 'logout':
  $data = logout();
  break;
 case 'getstatus':
  $data = getStatus();
  break;
 case 'getaction':
  $data = getAction();
  break;
 case 'saveaction':
  $data = saveAction();
  break;
 case 'delaction':
  $data = delAction();
  break;
 case 'doaction':
  $data = doAction();
  break;
 case 'gethost':
  $data = getHost();
  break;
 case 'savehost':
  $data = saveHost();
  break;
 case 'delhost':
  $data = delHost();
  break;
 case 'savehostorder':
  $data = saveHostOrder();
  break;
 case 'doping':
  $data = doPing();
  break;
 case 'dowol':
  $data = doWol();
  break;
 case 'getwol':
  $data = getWol();
  break;
 case 'delwol':
  $data = delWol();
  break;
 case 'chklogin':
  $data = chkLogin();
  break;
 default:
  errRes(400);
  exit;
}
if(!empty($data)){
 $res_data['data'] = $data;
}
echo json_encode($res_data);

function login(){
 global $param;
 $id = isset($param['usr_id']) ? $param['usr_id'] : '';
 $pass = isset($param['usr_pass']) ? $param['usr_pass'] : '';
 
 if($id == LOGIN_ID && $pass == LOGIN_PASS){
  $sid = sha1(uniqid(mt_rand(),true));
  $sql_sess = "INSERT INTO sessions (sid) VALUES (?)";
  $result_sess = execSql($sql_sess, array($sid));
 }else{
  errRes(401);
  exit;
 }
 return array('sid' => $sid, 'interval' => UPDATE_INTERVAL);
}

function logout(){
 global $sid;
 authCheck();
 $sql = "DELETE FROM sessions WHERE sid = ?";
 $result = execSql($sql, array($sid));
}

function chkLogin(){
 if(LOGIN_ID == '' || LOGIN_PASS == ''){
  $status = true;
  $sid = sha1(uniqid(mt_rand(),true));
  $sql_sess = "INSERT INTO sessions (sid) VALUES (?)";
  $result_sess = execSql($sql_sess, array($sid));
 }else{
  $status = false;
  $sid = null;
 }
 return array('status' => $status, 'sid' => $sid, 'interval' => UPDATE_INTERVAL);
}

function getStatus(){
 global $_const;
 authCheck();
 $cmd = "python3 {$_const(PROGRAM_DIR)}/ks0212.py -a GET -r ALL";
 exec($cmd, $out, $ret);
 if($ret){
  errRes(400);
  exit;
 }
 //return $out;
 $ret = json_decode(implode($out), true);
 //return $ret;
 $ret_data = array(
  $ret['data']['r1']['state'],
  $ret['data']['r2']['state'],
  $ret['data']['r3']['state'],
  $ret['data']['r4']['state'],
 );
 return $ret_data;
}

function saveAction(){
 global $param;
 authCheck();
 $aid = isset($param['aid']) ? $param['aid'] : "";
 $col_val = array(
  'name' => $param['action_name'],
  'relays' => json_encode($param['relays']),
  'action' => $param['action'],
 );
 if(empty($aid)){
  $sql = "INSERT INTO actions (name,relays,action) VALUES (:name,:relays,:action)";
 }else{
  $col_val['id'] = $aid;
  $sql = "UPDATE actions SET name = :name, relays = :relays, action = :action WHERE id = :id";
 }
 $result = execSql($sql, $col_val);
}

function getAction($aid=""){
 global $param;
 authCheck();
 if(isset($param['aid'])) $aid = $param['aid'];
 $where = "";
 if(!empty($aid)){
  $where = "WHERE id = {$aid}";
 }
 $sql = "SELECT * FROM actions {$where}";
 $result = execSql($sql);
 $res_data = array();
 foreach($result as $res){
  $res_data[] = array(
   'aid' => $res['id'],
   'action_name' => $res['name'],
   'relays' => json_decode($res['relays']),
   'action' => $res['action'],
  );
 }
 return $res_data;
}

function delAction($aid=""){
 global $param;
 authCheck();
 if(isset($param['aid'])) $aid = $param['aid'];
 if(empty($aid)){
  errRes(400);
  exit;
 }
 $sql = "DELETE FROM actions WHERE id = ?";
 $result = execSql($sql, array($aid));
}

function doAction($aid=""){
 global $param;
 authCheck();
 if(isset($param['aid'])) $aid = $param['aid'];
 if(empty($aid)){
  errRes(400);
  exit;
 }
 $sql = "SELECT * FROM actions WHERE id = ?";
 $result = execSql($sql, array($aid));
 $res = $result[0];
 $action = $res['action'];
 $relays = json_decode($res['relays']);
 switch($action){
  case 'on':
   $p1 = "-a SET -s ON";
   break;
  case 'off':
   $p1 = "-a SET -s OFF";
   break;
  default:
   if(!is_numeric($action)){
    errRes(400);
    exit;
   }
   $p1 = "-a PULSE -s ON -d {$action}";
 }
 $p2 = array();
 if(count($relays) == 4){
  $p2[] = "{$p1} -r ALL";
 }else{
  foreach($relays as $r){
   $p2[] = "{$p1} -r {$r}";
  }
 }
 foreach($p2 as $p){
  global $_const;
  $cmd = "python3 {$_const(PROGRAM_DIR)}/ks0212.py {$p}";
  exec($cmd, $out, $ret);
  if($ret){
   errRes(400);
   exit;
  }
 }
}

function getHost(){
 global $param;
 authCheck();
 $hid = isset($param['hid']) ? $param['hid'] : Null;
 $ping = isset($param['ping']) ? $param['ping'] : Null;
 $where = "";
 if(!empty($hid)){
  $where = "WHERE id = {$hid}";
 }
 $sql = "SELECT * FROM hosts {$where} ORDER BY od IS NULL, od";
 $result = execSql($sql);
 $res_data = array();
 $sql_r = "SELECT aid FROM host_action_r WHERE hid = ?";
 foreach($result as $res){
  $_data = array(
   'hid' => $res['id'],
   'host_name' => $res['name'],
   'host_memo' => $res['memo'],
   'host_ip' => $res['ip'],
   'host_mac' => $res['mac'],
   'actions' => array(),
  );
  $_data['status'] = $ping ? execPing($res['ip']) : Null;
  $result_r = execSql($sql_r, array($res['id']));
  $aids = array();
  foreach($result_r as $res_r){
   $aids[] = $res_r['aid'];
  }
  $_data['actions'] = $aids;
  $res_data[] = $_data;
 }
 return $res_data;
}

function saveHost(){
 global $param;
 authCheck();
 $hid = isset($param['hid']) ? $param['hid'] : Null;
 $actions = isset($param['actions']) ? $param['actions'] : Null;
 $col_val = array(
  'name' => $param['host_name'],
  'memo' => $param['host_memo'],
  'ip' => $param['host_ip'],
  'mac' => $param['host_mac'],
 );
 if(empty($hid)){
  $sql = "INSERT INTO hosts (name,memo,ip,mac) VALUES (:name,:memo,:ip,:mac)";
 }else{
  $col_val['id'] = $hid;
  $sql = "UPDATE hosts SET name = :name, memo = :memo, ip = :ip, mac = :mac WHERE id = :id";
 }
 $result = execSql($sql, $col_val);
 if(empty($hid)){
  $sql_hid = "SELECT id FROM hosts ORDER BY rowid DESC LIMIT 1";
  $result_hid = execSql($sql_hid);
  $hid = $result_hid[0]['id'];
 }
 $sql_del = "DELETE FROM host_action_r WHERE hid = ?";
 $result_del = execSql($sql_del, array($hid));
 $sql_ins = "INSERT INTO host_action_r (hid,aid) VALUES (?,?)";
 foreach($actions as $aid){
  $result_ins = execSql($sql_ins, array($hid,$aid));
 }
}

function delHost(){
 global $param;
 authCheck();
 $hid = isset($param['hid']) ? $param['hid'] : Null;
 if(empty($hid)){
  errRes(400);
  exit;
 }
 $sql = "DELETE FROM hosts WHERE id = ?";
 $result = execSql($sql, array($hid));
}

function saveHostOrder(){
 global $param;
 authCheck();
 $orders = isset($param['orders']) ? $param['orders'] : Null;
 if(empty($orders)){
  errRes(400);
  exit;
 }
 $sql = "UPDATE hosts SET od = ? WHERE id = ?";
 foreach($orders as $idx => $hid){
  $result = execSql($sql, array($idx,$hid));
 }
}

function getWol($wid=""){
 global $param;
 authCheck();
 if(isset($param['wid'])) $wid = $param['wid'];
 $where = "";
 if(!empty($wid)){
  $where = "WHERE id = {$wid}";
 }
 $sql = "SELECT * FROM wol_t {$where}";
 $result = execSql($sql);
 $res_data = array();
 foreach($result as $res){
  $res_data[] = array(
   'wid' => $res['id'],
   'mac_addr' => (strlen($res['mac_addr']) == 1 && $res['mac_addr'] >= 1 && $res['mac_addr'] <= 4) ? ('No.'.$res['mac_addr']) : $res['mac_addr'],
   'ip' => $res['ip'],
   'wait' => $res['wait'],
   'loop' => $res['loop'],
   'interval' => $res['interval'],
   'duration' => $res['duration'],
  );
 }
 return $res_data;
}

function delWol(){
 global $param;
 authCheck();
 $wid = isset($param['wid']) ? $param['wid'] : Null;
 if(empty($wid)){
  errRes(400);
  exit;
 }
 $sql = "DELETE FROM wol_t WHERE id = ?";
 $result = execSql($sql, array($wid));
}

function doWol($hid=""){
 global $param;
 authCheck();
 if(isset($param['hid'])) $hid = $param['hid'];
 if(empty($hid)){
  errRes(400);
  exit;
 }
 $sql = "SELECT mac FROM hosts WHERE id = ?";
 $result = execSql($sql, array($hid));
 $mac = $result[0]['mac'];
 if(!execWOL($mac)){
  errRes(400);
  exit;
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
