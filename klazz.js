//======================================================================================
// Имитация ООП для JS
var klazz = (function(undefined){
	var prot = "prototype";
	var ctor_str = "ctor";
	var sup_str = "$superClass";
	var is_function = function(x){return typeof(x)==="function";};
	var create_override=function($base,v,bk){
		return function(){
			bk=this[sup_str];this[sup_str]=$base;
			try{return v.apply(this,arguments);}
			finally{this[sup_str]=bk;};
		};
	};
	
	//var str_function="function";
	//var supress_ctor="{b10332b4-faa9-4908-a029-2b306b27ff85}";
	var klazz=function($ns,$base,$body,$mix){
		if($ns!==undefined){ // || $ns===supress_ctor){
			if(typeof($ns)!=="string" ){
				$mix=$body;
				$body=$base;
				$base=$ns;
				$ns=null;
			};
			if(typeof($base)!=="function"){
				$mix=$body;
				$body=$base;
				$base=klazz;
			};
			// 1) Создадим новый класс
			var newClass = function(a){this[ctor_str].apply(this, arguments);};

			var copyFunc=function(src,trg,sup,k,v){
				if(sup){
					for(k in src){
						v = src[k];
						if(is_function(v)){
							trg[k]=create_override($base,v);
						} else {
							trg[k]=v;
						}
					}
				} else {
					for(var k in src){
						trg[k]=src[k];
					}
				}
			};

			// 1.5) Скопируем "статические" свойства
			copyFunc($base, newClass);

			// 2) Установим потомка
			var helper = function(){};
			helper[prot] = $base[prot];
			var newClassPrototype = (newClass[prot] = new helper());
			//var newClassPrototype = (newClass[prot] = new $base(supress_ctor));
			
			// 2.5) Скопируем свойства из миксинов
			if($mix){
				for(var i=$mix.length-1;i>=0;--i){
					copyFunc($mix[prot],newClassPrototype,true);
				}
			}
			
			// 3) Скопируем свойства из шаблона
			if($body){
				copyFunc($body,newClassPrototype,true);
			}
			
			
			// 4) Дописываем потомка
			newClassPrototype.constructor = newClass;
			newClass[sup_str] = $base;
			newClassPrototype[sup_str] = $base;
			
			
			if($ns){
				klazz.$$nsAssign($ns,newClass,this);
				//newClass.$$name=$ns;
			};

			return newClass;
		};
	};
	klazz[prot][ctor_str]=function(){};
	klazz.$$override=function($methodName,$implementor){
		this[prot][$methodName]=create_override(this[sup_str],$implementor);
		return this;
	}
	klazz.$$replace=function($methodName,$implementor){
		var prev = this[prot][$methodName];
		return this.$$override($methodName,function(g){
			var aa=Array[prot].slice.call(arguments, 0)
			aa.unshift(prev);
			return $implementor.apply(this,aa);
		});
	};
	klazz.$$nsAssign=function($ns,$obj,x)
	{
		var arr=$ns.split(".");
		var l=arr.length;--l;
		for(var i=0;i<l;++i){
			var y=arr[i];
			if(!(y in x)){
				x[y]={};
			}
			x=x[y];
		}
		x[arr[l]]=$obj;
		return $obj;
	};
	return klazz;
})();
