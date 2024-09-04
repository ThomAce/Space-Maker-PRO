Content.makeFrontInterface(600, 400);

// > Components
const var FX1 = Synth.getEffect("DynamicEQ");

const var GRM = Engine.getGlobalRoutingManager();

const var BandGuideSC = [GRM.getCable("Band1Guide"), GRM.getCable("Band2Guide"), GRM.getCable("Band3Guide"), GRM.getCable("Band4Guide")];
const var BandGuideMain = [GRM.getCable("Band1GuideMain"), GRM.getCable("Band2GuideMain"), GRM.getCable("Band3GuideMain"), GRM.getCable("Band4GuideMain")];

for (i = 0; i < 4; i++)
{
	BandGuideSC[i].setRangeWithSkew(0.0, 100.0, 98.0);
	BandGuideMain[i].setRangeWithSkew(0.0, 100.0, 98.0);
}

const var BandGuideValue = [254,254,254,254];
const var BandGuideMainValue = [0.0,0.0,0.0,0.0];
const var BandGuideSCValue = [0.0,0.0,0.0,0.0];

BandGuideMain[0].registerCallback(function(value){
	BandGuideMainValue[0] = value;
}, AsyncNotification);

BandGuideMain[1].registerCallback(function(value){
	BandGuideMainValue[1] = value;
}, AsyncNotification);

BandGuideMain[2].registerCallback(function(value){
	BandGuideMainValue[2] = value;
}, AsyncNotification);

BandGuideMain[3].registerCallback(function(value){
	BandGuideMainValue[3] = value;
}, AsyncNotification);

BandGuideSC[0].registerCallback(function(value){
	BandGuideSCValue[0] = value;
}, AsyncNotification);

BandGuideSC[1].registerCallback(function(value){
	BandGuideSCValue[1] = value;
}, AsyncNotification);

BandGuideSC[2].registerCallback(function(value){
	BandGuideSCValue[2] = value;
}, AsyncNotification);

BandGuideSC[3].registerCallback(function(value){
	BandGuideSCValue[3] = value;
}, AsyncNotification);


const var BandGuidePanel = [
	Content.getComponent("Band1GuidePanel"), 
	Content.getComponent("Band2GuidePanel"), 
	Content.getComponent("Band3GuidePanel"),
	Content.getComponent("Band4GuidePanel")
];

const var t = Engine.createTimerObject();

t.setTimerCallback(function()
{
	for (i = 0; i < 4; i++)
	{
		var attenuation = FX1.getAttribute(FXAttributeIDs.attenuation[(i+1)]);
		
		if (((BandGuideMainValue[i] - (Bands[(i+1)].attenuation.getValue()*-2)) > BandGuideSCValue[i]) && (BandGuideSCValue[i] > 75))
			BandGuideValue[i] -= 25;
		else
			BandGuideValue[i] += 15;
			
		if (BandGuideValue[i] > 254)
			BandGuideValue[i] = 254;
		
		if (BandGuideValue[i] < 60)
			BandGuideValue[i] = 60;
		
		BandGuidePanel[i].set("itemColour", Colours.fromVec4([1, 0, 0, BandGuideValue[i]]));
	}
});

t.startTimer(100); //engedélyezd!

const var EQParamQSlider = Content.getComponent("EQParamQSlider");
const var EQParamAttackSlider = Content.getComponent("EQParamAttackSlider");
const var EQParamReleaseSlider = Content.getComponent("EQParamReleaseSlider");
const var EQParamGainSlider = Content.getComponent("EQParamGainSlider");
const var EQFilterTypeButton1 = Content.getComponent("EQFilterTypeButton1");
const var EQFilterTypeButton2 = Content.getComponent("EQFilterTypeButton2");
const var EQFilterTypeButton3 = Content.getComponent("EQFilterTypeButton3");
const var EQParamConfig = Content.getComponent("EQParamConfig");
const var ParamEQPanel = Content.getComponent("ParamEQPanel");
const var BandDraggingHolderPanel = Content.getComponent("4BandDraggingHolderPanel");
const var FrequencyScaleBackgroundPanel = Content.getComponent("FrequencyScaleBackgroundPanel");
const var FrequencyScaleBackgroundPanel2 = Content.getComponent("FrequencyScaleBackgroundPanel2");

//draggable elements
const var EQ1BandPanel = Content.getComponent("EQ1BandPanel");
const var EQ2BandPanel = Content.getComponent("EQ2BandPanel");
const var EQ3BandPanel = Content.getComponent("EQ3BandPanel");
const var EQ4BandPanel = Content.getComponent("EQ4BandPanel");

// < Components

// > Essential variables
//uniform size for all draggable elements!
const var EQDraggable = [EQ1BandPanel.get("width"), EQ1BandPanel.get("height")];
const var BandDraggingHolderPanelW = BandDraggingHolderPanel.get("width");
const var BandDraggingHolderPanelH = BandDraggingHolderPanel.get("height");

const var EQDragUpperBoundariesX = BandDraggingHolderPanelW - EQDraggable[0];
const var EQDragUpperBoundariesY = BandDraggingHolderPanelH - EQDraggable[1];

var ActiveEQ = 0;
var EQParamConfigVisible = false;

// < Essential variables

//create objects for knobs
function newEQKnob(band)
{
	var obj = {};
	//setup
	obj.band = Content.getComponent(("EQBand" + band));
	obj.q = Content.getComponent(("EQQ" + band));
	obj.attenuation = Content.getComponent(("EQAttenuation" + band)); //named as gain in FX script knobs
	obj.attack = Content.getComponent(("EQAttack" + band));
	obj.release = Content.getComponent(("EQRelease" + band));
	obj.type = Content.getComponent(("EQType" + band));
	obj.gain = Content.getComponent(("EQGain" + band)); //named as SCGain in FX script knobs
	
	return obj;
}

function newEQParamIds()
{
	var obj = {};
	obj.band = [null, 0,5,10,15];
	obj.q = [null, 1,6,11,16];
	obj.attenuation = [null, 2,7,12,19];
	obj.attack = [null, 3,8,13,17];
	obj.release = [null, 4,9,14,18];
	obj.type = [null, 20,21,22,23];
	obj.gain = [null, 24,25,26,27];
	
	return obj;
}

const var FXAttributeIDs = newEQParamIds();
const var Bands = [null];

for (i = 1; i < 5; i++)
{
	Bands[i] = newEQKnob(i);
	//attach control callback
	Bands[i].band.setControlCallback(changeEQBandParameter);
	Bands[i].q.setControlCallback(changeEQQParameter);
	Bands[i].attenuation.setControlCallback(changeEQAttenuationParameter);
	Bands[i].attack.setControlCallback(changeEQAttackParameter);
	Bands[i].release.setControlCallback(changeEQReleaseParameter);
	Bands[i].type.setControlCallback(changeEQTypeParameter);
	Bands[i].gain.setControlCallback(changeEQGaineParameter);
}

// > functions

inline function changeEQBandParameter(component, value)
{
	if ((ActiveEQ < 1) || (ActiveEQ > 4))
		return;
	
	FX1.setAttribute(FXAttributeIDs.band[ActiveEQ], Bands[ActiveEQ].band.getValue());
}

inline function changeEQQParameter(component, value)
{
	if ((ActiveEQ < 1) || (ActiveEQ > 4))
		return;
	
	FX1.setAttribute(FXAttributeIDs.q[ActiveEQ], Bands[ActiveEQ].q.getValue());
}

inline function changeEQAttenuationParameter(component, value)
{
	if ((ActiveEQ < 1) || (ActiveEQ > 4))
		return;
	
	FX1.setAttribute(FXAttributeIDs.attenuation[ActiveEQ], Bands[ActiveEQ].attenuation.getValue());
}

inline function changeEQAttackParameter(component, value)
{
	if ((ActiveEQ < 1) || (ActiveEQ > 4))
		return;
	
	FX1.setAttribute(FXAttributeIDs.attack[ActiveEQ], Bands[ActiveEQ].attack.getValue());
}

inline function changeEQReleaseParameter(component, value)
{
	if ((ActiveEQ < 1) || (ActiveEQ > 4))
		return;
	
	FX1.setAttribute(FXAttributeIDs.release[ActiveEQ], Bands[ActiveEQ].release.getValue());
}

inline function changeEQTypeParameter(component, value)
{
	if ((ActiveEQ < 1) || (ActiveEQ > 4))
		return;
	
	FX1.setAttribute(FXAttributeIDs.type[ActiveEQ], Bands[ActiveEQ].type.getValue());
}

inline function changeEQGaineParameter(component, value)
{
	if ((ActiveEQ < 1) || (ActiveEQ > 4))
		return;
	
	FX1.setAttribute(FXAttributeIDs.gain[ActiveEQ], Bands[ActiveEQ].gain.getValue());
}

function FrequencyToPixel(Frequency, Width) 
{
	if (Width < 1)
		Width = BandDraggingHolderPanelW;

    var minFrequency = Math.log(20) / Math.log(10);
    var maxFrequency = Math.log(20000) / Math.log(10);
    return (Math.log(Frequency) / Math.log(10) - minFrequency) / (maxFrequency - minFrequency) * Width;
}

function map(x, in_min, in_max, out_min, out_max) 
{
	return ((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
}

function getFreqScale(value)
{	
	if (value < 0)
		return 0;
	
	var pixelRatio = value / BandDraggingHolderPanelW;// (BandDraggingHolderPanelW - EQDraggable[0]);
	var logMinFrequency = Math.log10(20);
	var logMaxFrequency = Math.log10(20000);
	var freq = Math.pow(10, logMinFrequency + (logMaxFrequency - logMinFrequency) * pixelRatio);
	
	return freq;
}

function getdBScale(value)
{
	var mindB = -18;
	var maxdB = 0;
	return (maxdB + (mindB - maxdB) * (value / (BandDraggingHolderPanelH - EQDraggable[1])));
	//return map(value, 0, EQDragUpperBoundariesY, 0, -22);
}

/*
function dBtoPixel(dB)
{
	//return map(dB, 0, -18, 0, EQDragUpperBoundariesY);
}
*/

function dbToPixel(value)
{
    var mindB = -18;
    var maxdB = 0;

    if (value > maxdB) value = maxdB;
    if (value < mindB) value = mindB;

    return (value - maxdB) / (mindB - maxdB) * (BandDraggingHolderPanelH - EQDraggable[1]);
}

function resetEQProperties(component, defaultFrequency, defaultAttenuation)
{
	var PosX = FrequencyToPixel(defaultFrequency);
	var PosY = dbToPixel(defaultAttenuation);

	component.set("x", PosX);
	component.set("y", PosY);
	
	Bands[ActiveEQ].band.setValue(defaultFrequency);
	Bands[ActiveEQ].attenuation.setValue(defaultAttenuation);
	
	changeEQBandParameter(null, defaultFrequency);
	changeEQAttenuationParameter(null, defaultAttenuation);
	
	ActiveEQ = 0;
}

// < Functions

// > Draw background frequency scale on FrequencyScaleBackgroundPanel
FrequencyScaleBackgroundPanel.setPaintRoutine(function(g)
{
	g.setColour(Colours.floralwhite);
	g.setOpacity(0.3);
	
	var px = 0;
	var width = FrequencyScaleBackgroundPanel.get("width");
	var height = FrequencyScaleBackgroundPanel.get("height");
	
	g.drawLine(0, width, height/2, height/2, 3);
	
	for (i = 20; i <= 100; i++)
	{
		px = FrequencyToPixel(i, width);
		g.drawLine(px, px, 0, height, 1);
		
		i += 10;
	}
	
	px = FrequencyToPixel(100, width);
	g.drawLine(px, px, 0, height, 2);
	
	for (i = 200; i <= 1000; i++)
	{
		px = FrequencyToPixel(i, width);
		g.drawLine(px, px, 0, height, 1);
		
		i += 100;
	}
	
	px = FrequencyToPixel(1000, width);
	g.drawLine(px, px, 0, height, 2);
	
	for (i = 2000; i <= 10000; i++)
	{
		px = FrequencyToPixel(i, width);
		g.drawLine(px, px, 0, height, 1);
		
		i += 1000;
	}
	
	px = FrequencyToPixel(10000, width);
	g.drawLine(px, px, 0, height, 2);
	
	px = FrequencyToPixel(15000, width);
	g.drawLine(px, px, 0, height, 1);
	px = FrequencyToPixel(20000, width);
	g.drawLine(px, px, 0, height, 1);
});

FrequencyScaleBackgroundPanel2.setPaintRoutine(function(g)
{
	g.setColour(Colours.floralwhite);
	g.setOpacity(0.07);
	
	var px = 0;
	var width = FrequencyScaleBackgroundPanel.get("width");
	var height = FrequencyScaleBackgroundPanel.get("height");
	
	g.drawLine(0, width, height/2, height/2, 3);
	
	for (i = 20; i <= 100; i++)
	{
		px = FrequencyToPixel(i, width);
		g.drawLine(px, px, 0, height, 1);
		
		i += 10;
	}
	
	px = FrequencyToPixel(100, width);
	g.drawLine(px, px, 0, height, 2);
	
	for (i = 200; i <= 1000; i++)
	{
		px = FrequencyToPixel(i, width);
		g.drawLine(px, px, 0, height, 1);
		
		i += 100;
	}
	
	px = FrequencyToPixel(1000, width);
	g.drawLine(px, px, 0, height, 2);
	
	for (i = 2000; i <= 10000; i++)
	{
		px = FrequencyToPixel(i, width);
		g.drawLine(px, px, 0, height, 1);
		
		i += 1000;
	}
	
	px = FrequencyToPixel(10000, width);
	g.drawLine(px, px, 0, height, 2);
	
	px = FrequencyToPixel(15000, width);
	g.drawLine(px, px, 0, height, 1);
	px = FrequencyToPixel(20000, width);
	g.drawLine(px, px, 0, height, 1);
});

// < Draw background frequency scale on FrequencyScaleBackgroundPanel

Content.getComponent("EQParamConfigCloseButton").setControlCallback(onEQParamConfigCloseButton_Click);

EQParamConfig.setDraggingBounds([0,0,600,400]);

EQFilterTypeButton1.setControlCallback(onFilterTypeChange);
EQFilterTypeButton2.setControlCallback(onFilterTypeChange);
EQFilterTypeButton3.setControlCallback(onFilterTypeChange);

EQParamQSlider.setControlCallback(onEQParamQSlider);
EQParamAttackSlider.setControlCallback(onEQParamAttackSlider);
EQParamReleaseSlider.setControlCallback(onEQParamReleaseSlider);
EQParamGainSlider.setControlCallback(onEQParamGainSlider);

//load up params
// > loads default or saved parameters
function loadDefaults()
{
	for (i = 1; i < 5; i++)
	{
		FX1.setAttribute(FXAttributeIDs.band[i], Bands[i].band.getValue());
		FX1.setAttribute(FXAttributeIDs.q[i], Bands[i].q.getValue());
		FX1.setAttribute(FXAttributeIDs.attenuation[i], Bands[i].attenuation.getValue());
		FX1.setAttribute(FXAttributeIDs.attack[i], Bands[i].attack.getValue());
		FX1.setAttribute(FXAttributeIDs.release[i], Bands[i].release.getValue());
		FX1.setAttribute(FXAttributeIDs.type[i], Bands[i].type.getValue());
		FX1.setAttribute(FXAttributeIDs.gain[i], Bands[i].gain.getValue());
		
		if (i == 1)
		{
			EQ1BandPanel.set("x", FrequencyToPixel(Bands[i].band.getValue()));
			EQ1BandPanel.set("y", dbToPixel(Bands[i].attenuation.getValue()));
		}
		else if (i == 2)
		{
			EQ2BandPanel.set("x", FrequencyToPixel(Bands[i].band.getValue()));
			EQ2BandPanel.set("y", dbToPixel(Bands[i].attenuation.getValue()));
		}
		else if (i == 3)
		{
			EQ3BandPanel.set("x", FrequencyToPixel(Bands[i].band.getValue()));
			EQ3BandPanel.set("y", dbToPixel(Bands[i].attenuation.getValue()));
		}
		else
		{
			EQ4BandPanel.set("x", FrequencyToPixel(Bands[i].band.getValue()));
			EQ4BandPanel.set("y", dbToPixel(Bands[i].attenuation.getValue()));			
		}
	}
}

loadDefaults();
// < loads default or saved parameters

Content.getComponent("TestButton").setControlCallback(TestButton_Click);

inline function TestButton_Click(component, value)
{
	loadDefaults();
}

EQ2BandPanel.set("width",EQ1BandPanel.get("width"));
EQ2BandPanel.set("height",EQ1BandPanel.get("height"));
EQ2BandPanel.set("bgColour",EQ1BandPanel.get("bgColour"));
EQ2BandPanel.set("itemColour",EQ1BandPanel.get("itemColour"));
EQ2BandPanel.set("itemColour2",EQ1BandPanel.get("itemColour2"));
EQ2BandPanel.set("textColour",EQ1BandPanel.get("textColour"));
EQ2BandPanel.set("borderRadius",EQ1BandPanel.get("borderRadius"));

EQ3BandPanel.set("width",EQ1BandPanel.get("width"));
EQ3BandPanel.set("height",EQ1BandPanel.get("height"));
EQ3BandPanel.set("bgColour",EQ1BandPanel.get("bgColour"));
EQ3BandPanel.set("itemColour",EQ1BandPanel.get("itemColour"));
EQ3BandPanel.set("itemColour2",EQ1BandPanel.get("itemColour2"));
EQ3BandPanel.set("textColour",EQ1BandPanel.get("textColour"));
EQ3BandPanel.set("borderRadius",EQ1BandPanel.get("borderRadius"));

EQ4BandPanel.set("width",EQ1BandPanel.get("width"));
EQ4BandPanel.set("height",EQ1BandPanel.get("height"));
EQ4BandPanel.set("bgColour",EQ1BandPanel.get("bgColour"));
EQ4BandPanel.set("itemColour",EQ1BandPanel.get("itemColour"));
EQ4BandPanel.set("itemColour2",EQ1BandPanel.get("itemColour2"));
EQ4BandPanel.set("textColour",EQ1BandPanel.get("textColour"));
EQ4BandPanel.set("borderRadius",EQ1BandPanel.get("borderRadius"));

BandDraggingHolderPanel.set("width", ParamEQPanel.get("width"));
BandDraggingHolderPanel.set("x", 0);
BandDraggingHolderPanel.set("height", (ParamEQPanel.get("height")/2)+EQ1BandPanel.get("height")/2);
BandDraggingHolderPanel.set("y", (ParamEQPanel.get("height")/2)-EQ1BandPanel.get("height")/2);

EQ1BandPanel.setDraggingBounds([0,0,BandDraggingHolderPanelW,BandDraggingHolderPanelH]);
EQ2BandPanel.setDraggingBounds([0,0,BandDraggingHolderPanelW,BandDraggingHolderPanelH]);
EQ3BandPanel.setDraggingBounds([0,0,BandDraggingHolderPanelW,BandDraggingHolderPanelH]);
EQ4BandPanel.setDraggingBounds([0,0,BandDraggingHolderPanelW,BandDraggingHolderPanelH]);


function closeEQParamConfigPoup()
{
	EQParamConfig.set("visible", "false");
	
	ActiveEQ = 0;
	EQParamConfigVisible = false;
	
	setHover(null, EQ1BandPanel);
	setHover(null, EQ2BandPanel);
	setHover(null, EQ3BandPanel);
	setHover(null, EQ4BandPanel);
}

function showEQParameterPanel(EQNumber)
{
	EQParamConfig.set("visible", "true");
	ActiveEQ = EQNumber;
	
	EQ1BandPanel.set("borderSize", 0);
	EQ2BandPanel.set("borderSize", 0);
	EQ3BandPanel.set("borderSize", 0);
	EQ4BandPanel.set("borderSize", 0);
	
	var filterType = FX1.getAttribute(FXAttributeIDs.type[ActiveEQ]);
	
	EQFilterTypeButton1.setValue(0);
	EQFilterTypeButton2.setValue(0);
	EQFilterTypeButton3.setValue(0);
	
	if (filterType == 4)
		EQFilterTypeButton1.setValue(1);
	else if (filterType == 3)
		EQFilterTypeButton2.setValue(1);
	else
		EQFilterTypeButton3.setValue(1);
	
	EQParamQSlider.setValue(FX1.getAttribute(FXAttributeIDs.q[ActiveEQ]));
	EQParamAttackSlider.setValue(FX1.getAttribute(FXAttributeIDs.attack[ActiveEQ]));
	EQParamReleaseSlider.setValue(FX1.getAttribute(FXAttributeIDs.release[ActiveEQ]));
	EQParamGainSlider.setValue(FX1.getAttribute(FXAttributeIDs.gain[ActiveEQ]));
	
	Content.getComponent("EQParamQLabel").set("text", Engine.doubleToString(FX1.getAttribute(FXAttributeIDs.q[ActiveEQ]), 1));
	Content.getComponent("EQParamAttackLabel").set("text", Math.round(FX1.getAttribute(FXAttributeIDs.attack[ActiveEQ])) + "mS");
	Content.getComponent("EQParamReleaseLabel").set("text", Math.round(FX1.getAttribute(FXAttributeIDs.release[ActiveEQ])) + "mS");
	
	var freq = FX1.getAttribute(FXAttributeIDs.band[ActiveEQ]);
	if (freq < 1000)
		freq = Math.round(freq) + "Hz";
	else
		freq = Engine.doubleToString((freq / 1000),1) + "KHz";
	Content.getComponent("EQFrequencyLabel").set("text", freq);
	
	Content.getComponent("EQGainReductionLabel").set("text", Engine.doubleToString(FX1.getAttribute(FXAttributeIDs.attenuation[ActiveEQ]), 1) + "dB");	
	Content.getComponent("EQParamConfigHeaderLabel").set("text", "EQ " + ActiveEQ + " Parameters");
	Content.getComponent("EQParamGainLabel").set("text", Engine.doubleToString(FX1.getAttribute(FXAttributeIDs.gain[ActiveEQ]), 1) + "dB");
}

// -----------------------------------
//Default parameters
// -----------------------------------
/*
setEQProperties(EQ1BandPanel, 45, 0, FX1, 0, 2); //~30Hz
setEQProperties(EQ2BandPanel, 112, 0, FX1, 5, 7); //~100Hz
setEQProperties(EQ3BandPanel, 284, 0, FX1, 10, 12); //~1000Hz
setEQProperties(EQ4BandPanel, 455, 0, FX1, 15, 19); //~10000Hz
*/

function setHover(event, Panel)
{
	if (event.hover)
		Panel.set("borderSize", 2);
	else
		Panel.set("borderSize", 0);	
}

inline function setEQBandAndAttenuation(x,y,id)
{
	ActiveEQ = id;
	Bands[id].band.setValue(getFreqScale(x));
	Bands[id].attenuation.setValue(getdBScale(y));
	changeEQBandParameter(null, getFreqScale(x));
	changeEQAttenuationParameter(null, getdBScale(y));
}

EQ1BandPanel.setMouseCallback(function(event)
{
	//reset to default
	if (event.doubleClick)
	{
		resetEQProperties(EQ1BandPanel, 30, 0);
		closeEQParamConfigPoup();
		ActiveEQ = 0;
		return;
	}
	
	//hover sensing
	if (event.hover)
		EQ1BandPanel.set("borderSize", 2);
	else if ((! EQParamConfigVisible) || (ActiveEQ != 1))
		EQ1BandPanel.set("borderSize", 0);
		
	//set active EQ
	if (event.clicked || event.drag || event.rightClick)
		ActiveEQ = 1;
	else
		return; //skip any other events
	
	//open extra parameters
	if (event.rightClick)
	{
		EQParamConfigVisible = true;
		showEQParameterPanel(1);		
		return;
	}
	
	if ((event.clicked) && (EQParamConfigVisible != false))
		showEQParameterPanel(1);
	
	//skip everything else after this point
	if (! event.drag)
		return;
	
	if (EQParamConfigVisible)
		showEQParameterPanel(1);
	
	setEQBandAndAttenuation(EQ1BandPanel.get("x"), EQ1BandPanel.get("y"), 1);
});

EQ2BandPanel.setMouseCallback(function(event)
{
	//reset to default
	if (event.doubleClick)
	{
		resetEQProperties(EQ2BandPanel, 100, 0);
		closeEQParamConfigPoup();
		ActiveEQ = 0;
		return;
	}
	
	//hover sensing
	if (event.hover)
		EQ2BandPanel.set("borderSize", 2);
	else if ((! EQParamConfigVisible) || (ActiveEQ != 2))
		EQ2BandPanel.set("borderSize", 0);
		
	//set active EQ
	if (event.clicked || event.drag || event.rightClick)
		ActiveEQ = 2;
	else
		return; //skip any other events
	
	//open extra parameters
	if (event.rightClick)
	{
		EQParamConfigVisible = true;
		showEQParameterPanel(2);		
		return;
	}
	
	if ((event.clicked) && (EQParamConfigVisible != false))
		showEQParameterPanel(2);
	
	//skip everything else after this point
	if (! event.drag)
		return;
	
	if (EQParamConfigVisible)
		showEQParameterPanel(2);
	
	setEQBandAndAttenuation(EQ2BandPanel.get("x"), EQ2BandPanel.get("y"), 2);
});

EQ3BandPanel.setMouseCallback(function(event)
{
	//reset to default
	if (event.doubleClick)
	{
		resetEQProperties(EQ3BandPanel, 1000, 0);
		closeEQParamConfigPoup();
		ActiveEQ = 0;
		return;
	}
	
	//hover sensing
	if (event.hover)
		EQ3BandPanel.set("borderSize", 2);
	else if ((! EQParamConfigVisible) || (ActiveEQ != 3))
		EQ3BandPanel.set("borderSize", 0);
		
	//set active EQ
	if (event.clicked || event.drag || event.rightClick)
		ActiveEQ = 3;
	else
		return; //skip any other events
	
	//open extra parameters
	if (event.rightClick)
	{
		EQParamConfigVisible = true;
		showEQParameterPanel(3);		
		return;
	}
	
	if ((event.clicked) && (EQParamConfigVisible != false))
		showEQParameterPanel(3);
	
	//skip everything else after this point
	if (! event.drag)
		return;
	
	if (EQParamConfigVisible)
		showEQParameterPanel(3);
	
	setEQBandAndAttenuation(EQ3BandPanel.get("x"), EQ3BandPanel.get("y"), 3);
});

EQ4BandPanel.setMouseCallback(function(event)
{
	//reset to default
	if (event.doubleClick)
	{
		resetEQProperties(EQ4BandPanel, 10000, 0);
		closeEQParamConfigPoup();
		ActiveEQ = 0;
		return;
	}
	
	//hover sensing
	if (event.hover)
		EQ4BandPanel.set("borderSize", 2);
	else if ((! EQParamConfigVisible) || (ActiveEQ != 4))
		EQ4BandPanel.set("borderSize", 0);
		
	//set active EQ
	if (event.clicked || event.drag || event.rightClick)
		ActiveEQ = 4;
	else
		return; //skip any other events
	
	//open extra parameters
	if (event.rightClick)
	{
		EQParamConfigVisible = true;
		showEQParameterPanel(4);		
		return;
	}
	
	if ((event.clicked) && (EQParamConfigVisible != false))
		showEQParameterPanel(4);
	
	//skip everything else after this point
	if (! event.drag)
		return;
		
	if (EQParamConfigVisible)
		showEQParameterPanel(4);
	
	setEQBandAndAttenuation(EQ4BandPanel.get("x"), EQ4BandPanel.get("y"), 4);
});

ParamEQPanel.setMouseCallback(function(event)
{
	if (event.clicked)	
		closeEQParamConfigPoup();	
});

EQParamConfig.setMouseCallback(function(event)
{
	if (event.drag)
	{
		//EQParamConfig.set("itemColour", "#53000000");
		//EQParamConfig.set("itemColour2", "#4C000000");
		//EQParamConfig.set("itemColour", Colours.fromVec4(Colours.toVec4("#53000000")));
		EQParamConfig.set("itemColour", Colours.fromVec4([128, 128, 128, 160]));
		EQParamConfig.set("itemColour2", Colours.fromVec4([128, 128, 128, 160]));
		//EQParamConfig.set("textColour", Colours.fromVec4([255, 255, 255, 160]));
	}
	else
	{
		EQParamConfig.set("itemColour", Colours.fromVec4([160, 160, 160, 50]));
		EQParamConfig.set("itemColour2", Colours.fromVec4([0, 0, 0, 50]));
		//EQParamConfig.set("textColour", Colours.fromVec4([255, 255, 255, 160]));
	}
	
	//EQParamConfig.set("textColour", Colours.fromVec4([255, 255, 255, 200]));
	
	if (event.hover)
	{
		EQParamConfig.set("textColour", Colours.fromVec4([255, 255, 255, 200]));
	}
	else
	{
		EQParamConfig.set("textColour", Colours.fromVec4([255, 255, 255, 10]));
	}
	
	/*EQParamConfig.set("itemColour", "#62000000");
			EQParamConfig.set("itemColour2", "#D0000000");*/
});

BandDraggingHolderPanel.setMouseCallback(function(event)
{
	if (event.clicked)
		closeEQParamConfigPoup();
});

inline function onEQParamConfigCloseButton_Click(component, value)
{
	closeEQParamConfigPoup();	
}

inline function onEQParamQSlider(component, value)
{
	if (ActiveEQ < 1 || ActiveEQ > 4)
		return;
	
	Bands[ActiveEQ].q.setValue(value);
	FX1.setAttribute(FXAttributeIDs.q[ActiveEQ], Bands[ActiveEQ].q.getValue());
	Content.getComponent("EQParamQLabel").set("text", Engine.doubleToString(value, 1));
}

inline function onEQParamAttackSlider(component, value)
{	
	if (ActiveEQ < 1 || ActiveEQ > 4)
		return;
	
	Bands[ActiveEQ].attack.setValue(value);
	FX1.setAttribute(FXAttributeIDs.attack[ActiveEQ], Bands[ActiveEQ].attack.getValue());
	Content.getComponent("EQParamAttackLabel").set("text", Math.round(value) + "mS");
}

inline function onEQParamReleaseSlider(component, value)
{
	if (ActiveEQ < 1 || ActiveEQ > 4)
		return;
	
	Bands[ActiveEQ].release.setValue(value);
	FX1.setAttribute(FXAttributeIDs.release[ActiveEQ], Bands[ActiveEQ].release.getValue());
	Content.getComponent("EQParamReleaseLabel").set("text", Math.round(value) + "mS");
}

inline function onEQParamGainSlider(component, value)
{
	if (ActiveEQ < 1 || ActiveEQ > 4)
		return;
	
	Bands[ActiveEQ].gain.setValue(value);
	FX1.setAttribute(FXAttributeIDs.gain[ActiveEQ], Bands[ActiveEQ].gain.getValue());
	Content.getComponent("EQParamGainLabel").set("text", Engine.doubleToString(value, 1) + "dB");
}

inline function onFilterTypeChange(component, value)
{
	local FilterType = 4;

	if (EQFilterTypeButton1.getValue() == 1)
		FilterType = 4;
	else if (EQFilterTypeButton2.getValue() == 1)
		FilterType = 3;
	else
		FilterType = 2;
		
	if (ActiveEQ < 1 || ActiveEQ > 4)
		return;

	Bands[ActiveEQ].type.setValue(FilterType);
	FX1.setAttribute(FXAttributeIDs.type[ActiveEQ], Bands[ActiveEQ].type.getValue());
}

/*
const var GRM = Engine.getGlobalRoutingManager();
const var EQ1 = [GRM.getCable("EQ1Band"), GRM.getCable("EQ1Q"), GRM.getCable("EQ1Attenuation")];


//band
EQ1[0].registerCallback(function(value){
	//LimiterActiveLED.setValue(value);		
}, AsyncNotification);

//Q
EQ1[1].registerCallback(function(value){
	//LimiterActiveLED.setValue(value);		
}, AsyncNotification);

//Att...
EQ1[2].registerCallback(function(value){
	//LimiterActiveLED.setValue(value);		
}, AsyncNotification);*/


/*Content.getComponent("EQ").setControlCallback(onEQ);

inline function onEQ(component, value)
{
	Console.print(value);
}*/
/*
Content.getComponent("EQ").registerCallback(function(value)){
	Console.print(value);
}, AsyncNotification);
*/

/*
inline function onEnableLimiterButton_Click(component, value)
{
	DynamicEQ.setAttribute(22, value);
	if (value == 1)
		Content.getComponent("LimiterFeedbackLabel").set("text", "Limiter Activity");
	else
		Content.getComponent("LimiterFeedbackLabel").set("text", "Limiter Is Inactive");
}*/function onNoteOn()
{
	
}
 function onNoteOff()
{
	
}
 function onController()
{
	
}
 function onTimer()
{
	
}
 function onControl(number, value)
{
	
}
 