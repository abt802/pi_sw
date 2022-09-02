<?php
mb_language('ja');
mb_internal_encoding('UTF-8');
ini_set('default_charset', 'UTF-8');

$f = empty($_POST) ? $_GET : ($_POST ? $_POST : null);
define('PROGRAM_DIR', __DIR__);
//define('LOG_DIR', PROGRAM_DIR.'/log/');
define('DB_DIR', PROGRAM_DIR.'/db/');
define('DB_NAME', 'pisw');

$ini_arr = parse_ini_file("config.ini");
define('LOGIN_ID', $ini_arr['id']);
define('LOGIN_PASS', $ini_arr['pass']);
define('UPDATE_INTERVAL', $ini_arr['interval']);

function dbCon($db) {
 $db_file = DB_DIR."{$db}.db3";
 $dsn = "sqlite:$db_file";

 try{
  if(!is_readable($db_file)){
   throw new Exception('dbが見つかりません');
  }
  $pdo = new PDO($dsn);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
// sqlite高速化
  $pdo->query('PRAGMA journal_mode=MEMORY'); //一時ファイルをメモリー上に作る
  //$pdo->query('PRAGMA journal_mode=PERSIST'); //一時ファイルを永続化
  $pdo->query('PRAGMA synchronous=OFF'); //ファイル同期をOSに任せる
  return($pdo);
 }catch(PDOException $e){
  ACK(false,array('msg'=>'DB接続エラー','log'=>$e->getMessage()));
 }
}

function execSql($sql,$val=array(),$db='') {
 logDump($sql,'sql.log');
 $con = empty($db) ? dbCon(DB_NAME) : dbCon($db);
 if(empty($val)){
  $flag = $result = $con->query($sql);
 }else{
  $result = $con->prepare($sql);
  $flag = $result->execute($val);
 }
 if(!$flag){
  $info = $con->errorInfo();
  ACK(false,array('msg'=>'SQL実行エラー','log'=>$info[2]));
 }
 return $result->fetchAll();
}

function logDump($in,$file){
 if(!defined('LOG_DIR')){return;}
 if(!file_exists(LOG_DIR)){
  mkdir(LOG_DIR,0777,true);
  chmod(LOG_DIR,0777);
 }
 $addr = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : null;
 #if($_SERVER['REMOTE_ADDR'] == '127.0.0.1'){return;}
 ob_start();
 #print_r($in);
 var_dump($in);
 $buff = ob_get_contents();
 ob_end_clean();
 $buff = date('mdHis')." {$addr}\n{$buff}\n-----\n";
 $fp = fopen(LOG_DIR.$file,'a');
 fputs($fp,$buff);
 fclose($fp);
}

function ACK($status,$val){
 if($status){
  #header('Content-Type: application/json; charset=utf-8');
  echo json_encode($val);
 }else{
  if(isset($val['log'])){
   logDump($val['log'],'err.log');
   #unset($val['log']);
  }
  header('HTTP/1.1 500 Internal Server Error');
  #header('Content-Type: application/json; charset=utf-8');
  #echo $val['msg'];
  #echo json_encode($val);
  echo print_r($val, true);
  exit;
 }
}

function authCheck($return=False){
 global $sid;
 $sql = "SELECT id FROM sessions WHERE sid = ?";
 $result = execSql($sql, array($sid));
 if(count($result) == 0){
  if($return) return False;
  errRes(401);
  exit;
 }
 $id = $result[0]['id'];
 $sql = "UPDATE sessions SET rdate = DATETIME('now','localtime') WHERE sid = ?";
 $result = execSql($sql, array($sid));
 return $id;
}

function errRes($e){
 $header = 'HTTP/1.1 500 Internal Server Error';
 switch($e){
  case '400':
   $header = 'HTTP/1.1 400 Bad Request';
   break;
  case '401':
   $header = 'HTTP/1.1 401 Unauthorized';
   break;
  case '404':
   $header = 'HTTP/1.1 404 Not Found';
   break;
  case '409':
   $header = 'HTTP/1.1 409 Conflict';
   break;
  default:
   $header = 'HTTP/1.1 500 Internal Server Error';
 }
 header($header);
 exit;
}
