describe('Logger', function() {
	var timeRegexp = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
	var debugLogger;
	var logPath = rootPath+'/log/debugLogger.log'
	
	beforeEach(function(){
		debugLogger = new Logger(logPath);
		debugLogger.delete(); //ensures log is kept small
	});

	it('levels', function() {
		expect(debugLogger.levels.length).toEqual(6);
	});
	
	it('severity', function() {
		expect(debugLogger.severity).toEqual('DEBUG');
	});
	
	it('logPath', function(){
		expect(debugLogger.logPath).toEqual(logPath);
	});

	describe('file', function(){
		it('matches logPath', function(){
			expect(debugLogger.file().fullName).toEqual(logPath);
		});
		it('create directory if it does not exist', function(){
			try {
				var dir = new Folder(rootPath+'/log/test-dir');
				expect(dir.exists).toBe(false);
				
				var fooPath = dir.fullName+'/foo.log';
				var fooLogger = new Logger(fooPath);
				expect(fooLogger.file().fullName).toEqual(fooPath);
				expect(dir.exists).toBe(true);
				expect(new Folder(dir.fullName).exists).toBe(true);
			} finally {
				if(dir && dir.exists) {
					dir.remove();
				}
			}
		});
	});
	
	describe('messageString', function(){
		it('creates expected string', function() {
			var r = new RegExp('^'+timeRegexp.source+'|WARN|test$');
			expect(debugLogger.messageString('test','WARN')).toMatch(r);
		});
		
		it('creates JSON strings with objects', function(){
			var r = new RegExp('^'+timeRegexp.source+'|NOTICE|{"name":"foo","bar":1,"baz":{"fat":null}}$');
			expect(debugLogger.messageString({name: 'foo', bar: 1, baz:{fat: null}},'NOTICE')).toMatch(r);
		});
		
		it('handles ExtendScript objects', function(){
			expect(debugLogger.messageString($.global.app,'INFO')).toMatch(/name:\\"Adobe InDesign\\"/);
		});
	});
	
	it('meetsSeverity',function(){
		expect(debugLogger.meetsSeverity('CRITICAL')).toBe(true);
		expect(debugLogger.meetsSeverity('ERROR')).toBe(true);
		expect(debugLogger.meetsSeverity('WARN')).toBe(true);
		expect(debugLogger.meetsSeverity('NOTICE')).toBe(true);
		expect(debugLogger.meetsSeverity('INFO')).toBe(true);
		expect(debugLogger.meetsSeverity('DEBUG')).toBe(true);
	});
	
	describe('log', function(){
		it('throws error if severity is invalid', function(){
			expect(
				function(){
					debugLogger.log('bad severity','invalid');
				}
			).toThrow(
				new TypeError("Severity invalid is not one of Logger.levels")
			);
			expect(
				function(){
					debugLogger.log('bad severity','cRiTiCaL');
				}
			).toThrow(
				new TypeError("Severity cRiTiCaL is not one of Logger.levels")
			);
		});
	
		it('checks severity threshold', function(){
			expect(debugLogger.log('debug','DEBUG')).toBe(true);
			expect(debugLogger.log('info','INFO')).toBe(true);
		
			var infoLogger = new Logger('infoLogger.log', 'INFO');
			expect(infoLogger.log('debug','DEBUG')).toBe(false);
			expect(infoLogger.log('info','INFO')).toBe(true);
			infoLogger.delete();
		});
		
		it('creates file if it does not exist',function(){
			debugLogger.delete();
			expect(debugLogger.file().exists).toBe(false);
			expect(debugLogger.log('testing log','DEBUG')).toBe(true);
			expect(debugLogger.file().exists).toBe(true);
		});
	});
	
	it('exception', function(){
		var e = new Error('Test error')
		expect(debugLogger.exception(e,'NOTICE')).toBe(true);
		var msgRegexp = /Error: Test error in .*?LoggerSpec.jsx \(line \d+\)/
		var r = new RegExp('^'+timeRegexp.source+'|NOTICE|'+msgRegexp.source);
		expect(debugLogger.lastLog).toMatch(r)
	});
	
	it('delete', function(){
		expect(debugLogger.log('testing delete','DEBUG')).toBe(true);
		expect(debugLogger.delete()).toBe(true);
		expect(debugLogger.delete()).toBe(false);
	});
});
