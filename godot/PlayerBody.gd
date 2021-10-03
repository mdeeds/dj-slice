extends KinematicBody


# Declare member variables here. Examples:
# var a: int = 2
# var b: String = "text"


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	if Input.is_action_pressed("ui_right"):
		self.rotation = Vector3(0, 0.1, 0)
	elif Input.is_action_pressed("ui_left"):
		self.rotation = Vector3(0, -0.1, 0)
	else:
		self.rotation = Vector3(0,0,0)
