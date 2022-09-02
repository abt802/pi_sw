var action_data = {};
var timer;

function loginDo(id='', pass=''){
 let d = $.Deferred();
 let param = {
  usr_id: id,
  usr_pass: pass,
 }
 apiPost('login', param)
 .always(function(res){
  //console.log(res);
 })
 .done(function(res){
  let data = res.data;
  sessionStorage.setItem('sid', data.sid);
  sessionStorage.setItem('interval', data.interval);
  //return true;
  return d.resolve(true);
 })
 .fail(function(e){
  let action = failAction(e);
  if(action.http_status == 401){
   action.msg = 'IDまたはPassが違います';
   sessionStorage.clear();
  }
  alert(action.msg);
  //return false;
  return d.resolve(false);
  return d.reject(false);
 });
 return d.promise();
}

function logoutDo(){
 let d = $.Deferred();
 apiPost('logout')
 .always(function(res){
  //console.log(res);
  sessionStorage.clear();
  alert(`ログアウトしました`);
  //return true;
  return d.resolve(true);
 })
/*
 .fail(function(e){
  let action = failAction(e);
  alert(action.msg);
  return false;
  return d.resolve(false);
 });
*/
 return d.promise();
}

function profileGet(){
 let d = $.Deferred();
 if(!sessionStorage.getItem('sid')) return d.reject('認証エラー');
 apiPost('getuser')
 .always(function(res){
  //console.log(res);
 })
 .done(function(res){
  let data = res.data;
  let profile = {
   usr_id: data.usr_id,
   name: data.name || data.usr_id,
   email: data.email || '',
   icon: data.icon,
  }
  sessionStorage.setItem('profile', JSON.stringify(profile));
  return d.resolve(profile);
 })
 .fail(function(e){
  //console.log(e);
  let http_status = e.status;
  if (http_status == 401) return d.reject('認証エラー');
  return d.reject('エラー');
 });
 return d.promise();
}

function _initDisp(){
 let user_name = 'ゲスト';
 if(sessionStorage.getItem('sid')){
  let profile = JSON.parse(sessionStorage.getItem('profile'));
  user_name = profile.name;
  $('#guest_ctl').hide();
  $('#usr_ctl').show();
 }else{
  $('#guest_ctl').show();
  $('#usr_ctl').hide();
 }
 $('.user_name').text(user_name);
}

function apiPost(cmd, data='', upload=false){
 let sid = sessionStorage.sid;
 let ajax_post = {
  type: 'POST',
  url: 'api.php',
  data: {cmd: cmd, params: JSON.stringify(data)},
  dataType: 'json',
  headers: {
   'SID': sid,
  },
  //cache: false,
 }
 if(upload){
  ajax_post.processData = false;
  ajax_post.contentType = false;
 }
 return $.ajax(ajax_post)
}

function failAction(e){
 //console.log(e);
 let http_status = e.status;
 let res_data = {
  http_status: http_status,
  msg: '',
 }
 switch(http_status){
  case 400:
   res_data.msg = '入力エラー';
   break;
  case 401:
   res_data.msg = '認証エラー';
   sessionStorage.clear();
   alert(res_data.msg);
   initDisp();
   break;
  case 404:
   res_data.msg = 'エラー：データが有りません';
   break;
  case 409:
   res_data.msg = 'エラー：既に登録済みのIDです';
   break;
  default:
   res_data.msg = 'エラーが発生しました';
 }
 return res_data;
}

function infoDisp(text, timeout=0.5){
 $('#info_area').text(text).addClass('open_info');
 setTimeout(function(){
  $('#info_area').removeClass('open_info');
 }, timeout * 1000);
}
