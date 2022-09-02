<?php
include_once(__DIR__.'/../lib/core.php');

if(!empty($_GET)){
 $mac_addr = isset($_GET['mac']) ? $_GET['mac'] : null;
 $sw = isset($_GET['sw']) ? $_GET['sw'] : null;
 if((empty($mac_addr) && empty($sw)) || (!empty($mac_addr) && !empty($sw))) errRes(400);
 $mac_addr = empty($mac_addr) ? $sw : $mac_addr;
 cancelWOL($mac_addr);
}else{
 errRes(500);
}

function cancelWOL($mac_addr){
 if($mac_addr == 'ALL_RESET'){
  $mac_addr = '%%';
 }
 $sql_del = "DELETE FROM wol_t WHERE mac_addr like ?";
 $result_del = execSql($sql_del, array($mac_addr));
}
