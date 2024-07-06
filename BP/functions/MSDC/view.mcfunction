execute as @s if score @s msdc_view matches 0 run tag @s add msdc_changed
execute as @s if entity @s[tag=msdc_changed] run scoreboard players set @s msdc_view 1
execute as @s if entity @s[tag=!msdc_changed] run scoreboard players set @s msdc_view 0
tag @s remove msdc_changed