 jQuery.fn.editableTable = function() {
   if (this.prop('tagName') !== 'TABLE') return;

   this.addClass('editableTable');

   var tds = this.find('td');
   var activeTd = tds.eq(0).addClass('selected');
   var self = this;

   function selectTd(e) {

     var target = $(e.target.closest('td'));

     var offset = target.offset();

     if (!target || activeTd === target) return;
     if (target.has('textarea').length) return;
     accept();

     activeTd.removeClass('selected')
       .find('textarea').remove();
     activeTd = target.addClass('selected');
     /*----------- scrolling -------------*/
     var coords = {
       top: offset.top - $(window).scrollTop(),
       left: offset.left - $(window).scrollLeft(),
       bot: target[0].getBoundingClientRect().bottom,
       right: offset.left - $(window).scrollLeft() + target.outerWidth()
     };

     if (coords.top < 0) {
       $('body').animate({
         scrollTop: offset.top
       }, '500');
     }
     if (coords.left < 0) {
       $('body').animate({
         scrollLeft: offset.left
       }, '500');
     }
     if (coords.bot > $(window).height()) {
       $('body').animate({
         scrollTop: $(window).scrollTop() + coords.bot - $(window).height()
       }, '500');
     }
     if (coords.right > $(window).width()) {
       $('body').animate({
         scrollLeft: $(window).scrollLeft() + coords.right - $(window).width()
       }, '500');
     }
     /*----------- /scrolling -------------*/
   }

   function makeEditable(e) {
     var target = $(e.target.closest('td.selected'));

     if (!target || target.has('textarea').length) return;
     if (target.is('[data-readonly]')) return;

     var content = target.html();

     target.html("<textarea class='editableCell'>" + content + "</textarea>");
     target.find('textarea').focus();
   }

   function accept() {
     var value = activeTd.find('textarea').val();
     activeTd.html(value);
   }

   function decline() {
     activeTd.html(activeTd.html());
   }

   function tableKeyBindings(e) {
     var indexOfTd = tds.index(activeTd);
     var rowLength = self.find('tr:first').children().length;
     switch (e.which) {
       case 38: //top cell
         accept();
         tds.eq(indexOfTd - rowLength).trigger('click');
         break;
       case 40: //bot cell
         accept();
         tds.eq(indexOfTd + rowLength).trigger('click');
         break;
       case 37: //prev cell
         accept();
         tds.eq(indexOfTd - 1).trigger('click');
         break;
       case 39: //next cell
         accept(); 
         tds.eq(indexOfTd + 1).trigger('click');
         break;
       case 113: // F2, edit cell
         activeTd.trigger('dblclick');
         break;
       case 13: //enter
         accept();
         break;
       case 27: //escape 
         decline();
         break;
       default:
         activeTd.trigger('dblclick');
     }
   }

this.editCell = function(cell){
  cell.trigger('dblclick');
}

   this.on('dblclick', '.selected', makeEditable);
   this.on('click', 'td', selectTd);
   $('body').on('keydown', tableKeyBindings);
   //this.on('keydown', tableKeyBindings);

   return this;
 }