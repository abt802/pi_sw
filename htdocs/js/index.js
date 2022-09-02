$(function(){
 $('#login_btn').on('click', async function(){
  if(sessionStorage.sid) return false;
  let id = $('#login_id').val();
  let pass = $('#login_pass').val();
  if(!id) return false;
  await loginDo(id, pass);
  initDisp();
 });

 $('#logout_btn').on('click', async function(){
  if(!sessionStorage.sid) return false;
  await logoutDo();
  location.reload();
 });

 $('body').on('click', function(){
  if(!$('#menu_area').is(':hidden')) $('#menu_area').hide();
 });

 $('#menu_open').on('click', function(){
  $('#menu_area').show();
  return false;
 });

 $('#edit_btn').on('click', function(){
  mkActionBtn();
  $('#menu_area, #edit_button_area, #edit_area, #host_list, #host_edit, .status_view, #wol_view').hide();
  $('#edit_button_area').show();
 });

 $('#host_edit_btn').on('click', function(){
  mkHostList();
  $('#menu_area, #edit_button_area, #edit_area, #host_list, #host_edit, .status_view, #wol_view').hide();
  $('#host_list').show();
  $('#host_menu, #reorder_menu, .host_edit_btn, .grip').hide();
  $('#host_menu, .host_edit_btn').show();
 });

 $('#wol_list_btn').on('click', function(){
  mkWolList();
  $('#menu_area, #edit_button_area, #edit_area, #host_list, #host_edit, .status_view, #wol_view').hide();
  $('#wol_view').show();
 });
 $('#wol_reload_btn').on('click', function(){
  mkWolList();
 });
 $('#wol_list').on('click', '.wol_del_btn', async function(){
  if(!window.confirm('この予約を削除します')) return false;
  let wid = $(this).data('wid');
  if(!wid) return false;
  let res = await delWol(wid);
  if(res){
   alert('削除しました');
   mkWolList();
  }else{
   alert('削除できませんでした');
  }
 });
 $('#wol_close_btn').on('click', function(){
  $('#wol_view').hide();
  $('.status_view').show();
 });

 $('#button_area').on('click', '.action_btn', function(){
  let aid = $(this).data('bid');
  doAction(aid);
 });

 $('#add_btn').on('click', function(){
  setEdit();
 });

 $('#edit_button_area').on('click', '.action_btn', function(){
  let aid = $(this).data('bid');
  setEdit(aid);
 });

 $('#del_btn').on('click', function(){
  let aid = $('#bid').val();
  delAction(aid);
 });

 $('#save_btn').on('click', async function(){
  let res = await saveAction();
  if(res){
   mkActionBtn();
   $('#edit_area').hide();
   $('#edit_button_area').show();
  }
 });

 $('#edit_close_btn').on('click', function(){
  $('#edit_button_area').hide();
  $('.status_view').show();
 });

 $('#close_btn').on('click', function(){
  $('#edit_area').hide();
  $('#edit_button_area').show();
 });

 $('#update_btn').on('click', function(){
  chkStatus();
 });

 $('#host_add_btn').on('click', function(){
  setHostEdit();
 });
 $('#host_view').on('click', '.act_btn', function(){
  let aid = $(this).data('aid');
  doAction(aid);
 });
 $('#host_view').on('click', '.wol_btn', function(){
  let hid = $(this).data('hid');
  doWOL(hid);
 });
 $('#host_view').on('click', '.act_open', function(){
  if($(this).data('open')){
   $('span', this).text('▼');
   $(this).data('open', 0)
  }else{
   $('span', this).text('▲');
   $(this).data('open', 1)
  }
  $(this).next('.act_box').toggle();
 });
 $('#host_list').on('click', '.host_edit_btn', function(){
  let hid = $(this).data('hid');
  setHostEdit(hid);
 });
 $('#host_del_btn').on('click', async function(){
  if(!window.confirm('このホストを削除します')) return false;
  let hid = $('#hid').val();
  let res = await delHost(hid);
  if(res){
   mkHostList();
   $('#host_edit').hide();
   $('#host_list').show();
  }else{
   alert('削除出来ませんでした');
  }
 });
 $('#host_save_btn').on('click', async function(){
  let res = await saveHost();
  if(res){
   mkHostList();
   $('#host_edit').hide();
   $('#host_list').show();
  }
 });
 $('#host_close_btn').on('click', function(){
  $('#host_edit').hide();
  $('#host_list').show();
 });
 $('#host_list_close_btn').on('click', function(){
  mkHost();
  $('#host_list').hide();
  $('.status_view').show();
 });
 $('#host_reorder_btn').on('click', function(){
  $('#host_menu, #reorder_menu, .host_edit_btn, .grip').hide();
  $('#reorder_menu, .grip').show();
 });
 $('#reorder_cancel_btn').on('click', function(){
  $('#host_menu, #reorder_menu, .host_edit_btn, .grip').hide();
  $('#host_menu, .host_edit_btn').show();
  mkHostList();
 });
 $('#reorder_save_btn').on('click', async function(){
  let res = await saveHostOrder();
  $('#host_menu, #reorder_menu, .host_edit_btn, .grip').hide();
  $('#host_menu, .host_edit_btn').show();
  mkHostList();
 });

 $('#host_list ul').sortable({
  animation: 150,
  handle: '.grip',
 });
});

function nowDateTime(){
 let now = new Date();
 let Y = now.getFullYear();
 let M = ('00' + (now.getMonth()+1)).slice(-2);
 let D = ('00' + now.getDate()).slice(-2);
 let h = ('00' + now.getHours()).slice(-2);
 let m = ('00' + now.getMinutes()).slice(-2);
 let s = ('00' + now.getSeconds()).slice(-2);
 return `${Y}/${M}/${D} ${h}:${m}:${s}`;
}
