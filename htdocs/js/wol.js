function mkWolList(){
 apiPost('getwol')
 .always(function(res){
  console.log(res);
 })
 .done(function(res){
  let data = res.data;
  //let elm_box = ['<li><span>mac/SW</span><span>操作</span></li>'];
  let elm_box = [];
  $.each(data, function(idx,val){
   let li = $('<li>');
   let mac = $('<span class="mac">').text(`${val.mac_addr}`);
   let ip = $('<span class="ip">').text(`${val.ip || '-'}`);
   let del_btn = $(`<button class="wol_del_btn" data-wid="${val.wid}">`).text('削除');
   li.append(mac,ip,del_btn);
   elm_box.push(li);
  });
  if(elm_box.length == 0){
   elm_box = '<li>登録されていません</li>';
  }
  $('#wol_list li').remove();
  $('#wol_list').append(elm_box);
 })
}

function delWol(wid){
 let d = $.Deferred();
 if(!wid) return d.resolve(false);
 let param = {
  wid: wid
 }
 apiPost('delwol', param)
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
