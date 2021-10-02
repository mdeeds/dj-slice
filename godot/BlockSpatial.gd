extends Spatial


# Declare member variables here. Examples:
# var a: int = 2
# var b: String = "text"

var prototype = null
var elapsed = 0

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	self.prototype = $FallingBlock
	self.remove_child(self.prototype)


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	self.elapsed += delta
	if (elapsed >= 2):
		var b = self.prototype.duplicate()
		self.add_child(b)
		elapsed -= 2
