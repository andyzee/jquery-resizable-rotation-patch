$(document).ready(function(){
	$.ui.resizable.prototype._mouseDrag = function(event) {
		var angle = getAngle(this.element[0]);

		var data,
			el = this.helper, props = {},
			smp = this.originalMousePosition,
			a = switchAxis(this.axis, angle),
			prevTop = this.position.top,
			prevLeft = this.position.left,
			prevWidth = this.size.width,
			prevHeight = this.size.height,
			dx = (event.pageX-smp.left)||0,
			dy = (event.pageY-smp.top)||0,
			trigger = this._change[a];

		if (!trigger) {
			return false;
		}

		// Calculate the attrs that will be change
		data = trigger.apply(this, [event, dx, dy]);

		// Put this in the mouseDrag handler since the user can start pressing shift while resizing
		this._updateVirtualBoundaries(event.shiftKey);
		if (this._aspectRatio || event.shiftKey) {
			data = this._updateRatio(data, event);
		}

		data = this._respectSize(data, event);

		this._updateCache(data);

		// plugins callbacks need to be called first
		this._propagate("resize", event);

		if (this.position.top !== prevTop) {
			props.top = this.position.top + "px";
		}
		if (this.position.left !== prevLeft) {
			props.left = this.position.left + "px";
		}
		if (this.size.width !== prevWidth) {
			props.width = this.size.width + "px";
		}
		if (this.size.height !== prevHeight) {
			props.height = this.size.height + "px";
		}
		el.css(props);

		if (!this._helper && this._proportionallyResizeElements.length) {
			this._proportionallyResize();
		}

		// Call the user callback if the element was resized
		if ( ! $.isEmptyObject(props) ) {
			this._trigger("resize", event, this.ui());
		}

		return false;
	}

	function getAngle(el) {
		var st = window.getComputedStyle(el, null);
		var tr = st.getPropertyValue("-webkit-transform") ||
				st.getPropertyValue("-moz-transform") ||
				st.getPropertyValue("-ms-transform") ||
				st.getPropertyValue("-o-transform") ||
				st.getPropertyValue("transform") ||
				null;
		if(tr && tr != "none"){
			var values = tr.split('(')[1];
				values = values.split(')')[0];
				values = values.split(',');

			var a = values[0];
			var b = values[1];

			var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
			return angle;
		}
		else
			return 0;
	}

	function switchAxis(axis, angle) {
		while(angle >= 360) angle = 360-angle;
		while(angle < 0) angle = 360+angle;
		var axisArray = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];
		var octant = Math.round(angle/45); // 0 .. 7
		var index = 0;
		if ( [].indexOf ) {
			index = axisArray.indexOf(axis);
		} else {
	    	for(var i=0; i<axisArray.length; i++) {
				if (axisArray[i] === axis) index = i;
			}
		}
		var newAxisIndex = (index + octant) % 8;
		return axisArray[newAxisIndex];
	}
});