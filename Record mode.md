# Record mode

## Approach 1

1. Keep track which keys are held down (1,2,3,4)
2. In interval, if key is pressed, output the sound

### Pros: 
- Simple implementation
- Might auto align the beats, 
- Precise, but not accurate

### Cons:
- Very finique, Might require the beat to be held down before the next tick, to be triggered

```
.   .   .   .  
   11 
^ will be applied to tick #2
``` 

```
.   .   .   .  
     1
^ will not be applied to any tick
```

## Approach 2

1. Start recording when first key is pressed
1. Record the start time of the playback
1. Record key presses
1. Round the timing of the keypress to the nearest tick

    a. Calculate the difference in time from the start (modulo the amount of ticks * tick duration) to the key press
    b. Calculate the Discrete tick that the keypress is closest to. This can be implemented by rounding the number

### Pros: 
 - Will auto align the beats
 - Precise and accurate
 - More complex implementation
 - Easier for the user, since they don't have to hit the keys before the tick happens

### Cons:

