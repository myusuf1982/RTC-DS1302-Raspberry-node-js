     var rpio = require('rpio');   //ok to git


//class DS1302:
// 5us
      var CLK_DELAY = 5
	
	//function __init__(self, clk_pin=11, data_pin=13, ce_pin=15){
		var _clk_pin=35, _data_pin=37, _ce_pin=33
	
        // init rpio
        // no warnings
       //gk da lib  rpio.setwarnings(False)
        // use safer pin number (avoid rpio renumber on each Pi release)
      //  rpio.setmode(rpio.BOARD)
        // set rpio pins
        		
		// CLK and CE (sometime call RST) pin are always output
                rpio.open(_clk_pin, rpio.OUTPUT,  rpio.LOW)
		rpio.open(_ce_pin, rpio.OUTPUT, rpio.LOW)
                
		rpio.pud(_data_pin, rpio.PULL_DOWN);


        // turn off WP (write protect)
        _start_tx()
        _w_byte(0x8e)
        _w_byte(0x00)
        _end_tx()

        // charge mode is disabled
        _start_tx()
        _w_byte(0x90)
        _w_byte(0x00)
        _end_tx()

// write_datetime()  // sudah di setting

var k=0;
while( k==0) {

      read_datetime()  // start disini
rpio.msleep(900);
}

    function _start_tx(){
        /*
        Start of transaction.
        */
		rpio.write(_clk_pin, rpio.LOW)
		rpio.write(_ce_pin, rpio.HIGH)

	}

    function _end_tx(){
        /*
        End of transaction.
        */
        rpio.mode(_data_pin, rpio.INPUT)
        rpio.write(_clk_pin, rpio.LOW)
        rpio.write(_ce_pin, rpio.LOW)
	}

    function _r_byte(){
/*
        Read byte from the chip.
        {return{ byte value
        {rtype{ int
  */
//console.log("mulai read")
// data pin is now input (pull-down resistor embedded in chip)
        // clock the byte from chip
        var byte = 0
        for (var i = 0; i < 8; i++) {
            // make a high pulse on CLK pin
            rpio.write(_clk_pin, rpio.HIGH)
            rpio.usleep(CLK_DELAY); 
//            rpio.msleep(100); 
            rpio.write(_clk_pin, rpio.LOW)
        	rpio.usleep(CLK_DELAY);
//            rpio.msleep(100); 
			
            // chip out data on clk falling edge{ store current bit into byte
            bit = rpio.read(_data_pin)
//console.log("_r_byte loop bit dari pin pagi= " +bit);
            byte |= ((2 ** i) * bit)  // sampai sini .....

		}

        // return byte value
        return byte    
    }

    function _w_byte(byte){ //================================================================parameter ?
        /*
        Write byte to the chip.
        {param byte{ byte value
        {type byte{ int
        */

//console.log("mulai write")
//            rpio.msleep(100);

        // data pin is now output
        rpio.mode(_data_pin, rpio.OUTPUT)
        // clock the byte to chip
        for (var i = 0; i < 8; i++) {
            rpio.write(_clk_pin, rpio.LOW)
            rpio.usleep(CLK_DELAY)
            // chip read data on clk rising edge
            rpio.write(_data_pin, byte & 0x01)
            byte >>= 1
//            console.log(byte & 0x01);
            rpio.write(_clk_pin, rpio.HIGH)
            rpio.usleep(CLK_DELAY)

        }

    }
        function read_ram(){
        /*
        Read RAM as bytes
        {return{ RAM dumps
        {rtype{ bytearray
        */

        // start of message
        _start_tx()
        // read ram burst
        _w_byte(0xff)
        // read data bytes
       var  byte_a = bytearray()  // ini belum tentu benar======================================================??
       for (var i = 0; i < 31; i++) { 
                byte_a.push(_r_byte())
       }   // apakah disini tutup ============================================================================?
                // end of message
        _end_tx()
        return byte_a
    }

    function write_ram(byte_a){
        /*
        Write RAM with bytes
        {param byte_a{ bytes to write
        {type byte_a{ bytearray
        */

        // start message
        _start_tx()
        // write ram burst
        _w_byte(0xfe)
        // write data bytes
     //   for (var i = 0; i = min(len(byte_a)); 31) { //=======================================================?
                
       //     _w_byte(ord(byte_a[i:i + 1])) //====================================




  _end_tx()

    }


    function read_datetime(){
        /*
        Read current date and time from RTC chip.
        {return{ date and time
        {rtype{ datetime.datetime
        */

        // start message
        _start_tx()
        // read clock burst
        _w_byte(0xbf)
        var byte_l = []

        for(i=0; i<8; i++) {



        byte_l.push(_r_byte())  // ini append error
        // end of message
        }

//ini buat test aja
//byte_l = [10,30,15,1,30,25,25,2]

//console.log("isi ds 1302 byte_l = " + byte_l)   
     _end_tx()
        // decode bytes
        var second = ((byte_l[0] & 0x70) >> 4) * 10 + (byte_l[0] & 0x0f)
        var minute = ((byte_l[1] & 0x70) >> 4) * 10 + (byte_l[1] & 0x0f)
        var hour = ((byte_l[2] & 0x30) >> 4) * 10 + (byte_l[2] & 0x0f)
        var day = ((byte_l[3] & 0x30) >> 4) * 10 + (byte_l[3] & 0x0f)
   var weekday = ((byte_l[4] & 0x10) >> 4) * 10 + (byte_l[4] & 0x0f)
        var month = ((byte_l[5] & 0x10) >> 4) * 10 + (byte_l[5] & 0x0f)
        var year = ((byte_l[6] & 0xf0) >> 4) * 10 + (byte_l[6] & 0x0f) + 2000
      

        // return datetime value
        //return datetime.datetime(year, month, day, hour, minute, second) // ============================== datetime ??

console.log("isi ds 1302 second = " + second)
console.log("isi ds 1302 minute = " + minute)
console.log("isi ds 1302 hour   = " + hour)
console.log("isi ds 1302 day    = " + day)
console.log("isi ds 1302 month  = " + weekday)
console.log("isi ds 1302 weekday  = " + month)
console.log("isi ds 1302 year   = " + year)
    }
     
    function write_datetime(dt){
        /*
        Write a python datetime to RTC chip.
        {param dt{ datetime to write
        {type dt{ datetime.datetime
        */
   // format message ===================================================================== dt ???
       var  byte_l = [0] * 9
       
        _start_tx()
        _w_byte(0xbe)
       
            _w_byte(0x00) //second
            _w_byte(0x26) // minute
            _w_byte(0x20) // hour
           // _w_byte(0x25) // day
            //_w_byte(0x11) // month
           // _w_byte(0x07) // weekday
            //_w_byte(0x18) // year

       
        _end_tx()
    }

    //@staticmethod //============================?
    function close(){

    rpio.close(_data_pin);
    rpio.close(_clk_pin);
    rpio.close(_ce_pin);

        /* """
        Clean all GPIOs.
        """
        */
    }
