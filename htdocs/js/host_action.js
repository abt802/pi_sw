async function chkHost(){
 let data = await getHost(null,true);
 $.each(data, function(idx,val){
  if(!val.host_ip) return true;
  $(`#host${val.hid} .ping`).removeClass(['led_green','led_red']);
  if(val.status === true){
   $(`#host${val.hid} .ping`).html('● OK').addClass('led_green');
  }else if(val.status === false){
   $(`#host${val.hid} .ping`).html('&#x2716; NG').addClass('led_red');
  }else{
   $(`#host${val.hid} .ping`).html('-');
  }
 });
}

async function mkHost(){
 let _act_data = await getAction();
 $.each(_act_data, function(idx,val){
  action_data[val.aid] = val;
 });
 let data = await getHost();
 let elm_box = [];
 $.each(data, function(idx,val){
  let fset = $(`<fieldset id="host${val.hid}">`);
  let leg = $('<legend>').text(`${val.host_name}`);
  let ul = $('<ul>');
  if(val.host_mac){
   let wol = $('<li>').append($(`<button class="wol_btn" data-hid="${val.hid}">`).text('WOL'), val.host_ip ? `${val.host_ip}` : '');
   ul.append(wol);
  }else{
   let wol = $('<li>').append(val.host_ip ? `${val.host_ip}` : '');
   ul.append(wol);
  }
  if(val.host_ip){
   let ping = $('<li>').html('Ping: <span class="ping">-</span>');
   ul.append(ping);
  }
  let act_ul = $('<ul class="act_box">');
  $.each(val.actions, function(a_idx,a_val){
   let act = action_data[a_val];
   let btn = $('<li>').append($(`<button class="act_btn" data-aid="${act.aid}">`).html('&nbsp;<img class="power_icon" src="img/power_icon.png">'),`${act.action_name}`);
   act_ul.append(btn);
  });
  let act_open = $('<div class="act_open" data-open="0"><span>▼</span></div>');
  fset.append(leg, ul, act_open, act_ul);
  elm_box.push(fset);
 });
 $('#host_view fieldset').remove();
 $('#host_view').append(elm_box);
 chkHost();
}

async function mkHostList(){
 let data = await getHost();
 let elm_box = [];
 $.each(data, function(idx,val){
  let li = $('<li>');
  let edit = $(`<button class="host_edit_btn" data-hid="${val.hid}">`).text('Edit');
  let handle = $('<span class="grip">');
  let host = $('<span>').text(`${val.host_name}`);
  li.append(edit,handle,host);
  elm_box.push(li);
 });
 $('#host_list li').remove();
 $('#host_list ul').append(elm_box);
 $('span.grip').hide();
}

async function setHostEdit(hid=''){
 $('#host_edit').find('#hid, :text').val('').end().find(':checked').prop('checked', false);
 mkActionCheckbox();
 if(hid){
  let data = await getHost(hid);
  $.each(data, function(idx,val){
   $('#host_name').val(val.host_name);
   $('#host_ip').val(val.host_ip);
   $('#host_mac').val(val.host_mac);
   $('#action_list input[type="checkbox"').val(val.actions);
   $('#hid').val(val.hid);
  });
 }
 $('#host_list').hide();
 $('#host_edit').show();
}

function getHost(hid='',ping=false){
 let d = $.Deferred();
 let param = {
  hid: hid,
  ping: ping,
 }
 apiPost('gethost', param)
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

function saveHost(){
 let d = $.Deferred();
 let hid = $('#hid').val() || '';
 let host_name = $('#host_name').val() || '';
 let host_ip = $('#host_ip').val() || '';
 let host_mac = $('#host_mac').val() || '';
 let host_memo = $('#host_memo').val() || '';
 let actions = [];
 $('#action_list input:checked').each(function(){
  actions.push($(this).val());
 });
 if(!host_name) return d.resolve(false);
 let param = {
  hid: hid,
  host_name: host_name,
  host_ip: host_ip,
  host_mac: host_mac,
  host_memo: host_memo,
  actions: actions,
 }
//console.log(param);
 apiPost('savehost', param)
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

function delHost(hid){
 let d = $.Deferred();
 if(!hid) return d.resolve(false);
 let param = {
  hid: hid
 }
 apiPost('delhost', param)
 .always(function(res){
  //console.log(res);
 })
 .done(function(res){
  let data = res.data;
  return d.resolve(true);
 })
 .fail(function(e){
  let action = failAction(e);
  console.log(action);
  //alert(action.msg);
  return d.resolve(false);
 });
 return d.promise();
}

function doWOL(hid){
 if(!hid) return false;
 let param = {
  hid: hid
 }
 $('#info_area').text('実行中...').addClass('open_info');
 apiPost('dowol', param)
 .always(function(res){
  //console.log(res);
  $('#info_area').removeClass('open_info');
 })
 .done(function(res){
  let data = res.data;
  chkHost();
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

function mkActionCheckbox(){
 //let data = await getAction();
 let lis = [];
 $.each(action_data, function(idx,val){
  let li = $('<li>');
  let chkbox = $(`<input type="checkbox" value="${val.aid}">`);
  li.append(chkbox, `${val.action_name}`);
  lis.push(li);
 });
 $('#action_list *').remove();
 $('#action_list').append(lis);
}

function saveHostOrder(){
 let d = $.Deferred();
 let orders = [];
 $('.host_edit_btn').each(function(){
  let hid = $(this).data('hid');
  orders.push(hid);
 });
 if(!orders.length) return d.resolve(false);
 let param = {
  orders: orders
 }
//console.log(param);
 apiPost('savehostorder', param)
 .always(function(res){
  //console.log(res);
 })
 .done(function(res){
  let data = res.data;
  return d.resolve(true);
 })
 .fail(function(e){
  let action = failAction(e);
  alert(action.msg);
  return d.resolve(false);
 });
 return d.promise();
}
