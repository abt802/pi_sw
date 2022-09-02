async function initDisp(){
 let login = await chkLogin();
 //if(sessionStorage.sid){
 if(login){
  $('#login_area').hide();
  mkHost();
  chkSw();
  $('#main_area').show();
  let interval = sessionStorage.interval || 30;
  timer = setInterval(chkStatus, interval * 1000);
  $('#updatetime').text(`(${nowDateTime()})`);
 }else{
  $('#main_area').hide();
  $('#login_area').show();
  clearInterval(timer);
 }
}

function chkStatus(){
 chkSw();
 chkHost();
 $('#updatetime').text(`(${nowDateTime()})`);
}

async function mkActionBtn(){
 let data = await getAction();
 let lis = [];
 $.each(data, function(idx,val){
  let li = $('<li>');
  let edit = $(`<button class="action_btn" data-bid="${val.aid}">`).text('Edit');
  let act_name = $('<span>').text(`${val.action_name}`);
  li.append(edit,act_name);
  lis.push(li);
  action_data[val.aid] = val;
 });
 $('.button_box *').remove();
 $('.button_box').append(lis);
}

function chkSw(){
 apiPost('getstatus')
 .always(function(res){
  //console.log(res);
 })
 .done(function(res){
  let data = res.data;
  $('#sw_status li span').removeClass();
  $.each(data, function(idx, val){
   if(val){
    $(`li#r${idx+1} span`).removeClass().addClass('led_green');
   }
  });
 })
 .fail(function(e){
  let action = failAction(e);
  console.log(action);
  infoDisp('ステータスを取得できませんでした', 10);
  $('#sw_status li span').removeClass().addClass('led_yellow');
 });
}

async function setEdit(aid=''){
 $('#edit_area').find('#bid, :text').val('').end().find(':checked').prop('checked', false);
 $('#del_btn').hide();
 if(aid){
  let data = await getAction(aid);
  $.each(data, function(idx,val){
   $('#del_btn').show();
   $('#bid').val(val.aid);
   $('#action_name').val(val.action_name);
   $('.relay').val(val.relays);
   if(isNaN(val.action)){
    $('.action_radio').val([val.action]);
   }else{
    $('.action_radio:radio').val(['pulse']);
    $('#duration').val(val.action);
   }
  }); 
 }
 $('#edit_button_area').hide();
 $('#edit_area').show();
}

function doAction(aid){
 if(!aid) return false;
 let param = {
  aid: aid
 }
 $('#info_area').text('実行中...').addClass('open_info');
 apiPost('doaction', param)
 .always(function(res){
  //console.log(res);
  $('#info_area').removeClass('open_info');
 })
 .done(function(res){
  let data = res.data;
  chkStatus();
  infoDisp('実行しました');
 })
 .fail(function(e){
  let action = failAction(e);
  console.log(action);
  //alert(action.msg);
  infoDisp('実行出来ませんでした');
  return false;
 });
}

function delAction(aid){
 if(!aid) return false;
 let param = {
  aid: aid
 }
 apiPost('delaction', param)
 .always(function(res){
  //console.log(res);
 })
 .done(function(res){
  let data = res.data;
  mkActionBtn();
  alert('削除しました');
  $('#del_btn').hide();
  $('#edit_area').hide();
  $('#edit_button_area').show();
 })
 .fail(function(e){
  let action = failAction(e);
  console.log(action);
  //alert(action.msg);
  alert('削除出来ませんでした');
 });
}

function getAction(aid=''){
 let d = $.Deferred();
 let param = {
  aid: aid
 }
 apiPost('getaction', param)
 .always(function(res){
  //console.log(res);
 })
 .done(function(res){
  let data = res.data;
  return d.resolve(data);
 })
 .fail(function(e){
  let action = failAction(e);
  //alert(action.msg);
  //return false;
  return d.reject(action);
 });
 return d.promise();
}

function saveAction(){
 let d = $.Deferred();
 let aid = $('#bid').val() || '';
 let action_name = $('#action_name').val();
 let relays = [];
 $('.relay:checked').each(function(){
  relays.push($(this).val());
 });
 let action = $('.action_radio:checked').val();
 if(action == 'pulse'){
  action = $('#duration').val();
 }
 if(!(action_name && action && relays.length)) return d.resolve(false);
 let param = {
  aid: aid,
  action_name: action_name,
  relays: relays,
  action: action,
 }
 apiPost('saveaction', param)
 .always(function(res){
  //console.log(res);
 })
 .done(function(res){
  let data = res.data;
  //return true;
  return d.resolve(true);
 })
 .fail(function(e){
  let action = failAction(e);
  alert(action.msg);
  //return false;
  return d.resolve(false);
 });
 return d.promise();
}

function chkLogin(){
 let d = $.Deferred();
 if(sessionStorage.sid){
  return d.resolve(true);
 }
 apiPost('chklogin')
 .always(function(res){
  //console.log(res);
 })
 .done(function(res){
  let data = res.data;
  let status = data.status;
  if(status){
   sessionStorage.setItem('sid', data.sid);
   sessionStorage.setItem('interval', data.interval);
  }
  return d.resolve(status);
 })
 .fail(function(e){
  let action = failAction(e);
  console.log(action);
  return d.resolve(false);
 });
 return d.promise();
}
