import { system, world, Scoreboard, Dimension, ItemStack } from '@minecraft/server';
import { controlPSD, settingPSD, editFunct, selectFunct, runFunct } from './functions/functions.js'

let position = new Array(3)
const PSD_Regex = /^msdc:msdc\d{4}.*$/;
const Funct_Regex = /^msdc:function\d{1}$/;


world.afterEvents.entitySpawn.subscribe(data => {
    const entity = data.entity;
    const player = world.getDimension(entity.dimension.id).getPlayers({ location: entity.location, closest: 1 })[0];

    if (PSD_Regex.test(entity.typeId)) {
        const yRot = Math.round(player.getRotation().y / 90) * 90 + 180;
        entity.setRotation({ x: 0, y: yRot });
    } else if (entity.typeId === 'msdc:setting') {
        const psd = world.getDimension(entity.dimension.id).getEntities({ location: entity.location, closest: 1 })[0];
        settingPSD(player, psd);
    }
});

world.afterEvents.itemUse.subscribe(data => {
    const player = data.source;
    const item = data.itemStack;
    if (item.typeId == 'msdc:psd_setting') {
        world.getAllPlayers().forEach(player => {
            if (player.hasTag('in_msdc_setting_mode')) {
                player.removeTag('in_msdc_setting_mode');
                player.sendMessage('MSDC >\u00A76 PSD 설정 모드에서 빠져나왔습니다.');
            } else {
                player.addTag('in_msdc_setting_mode');
                player.sendMessage('MSDC >\u00A7a PSD 설정 모드에 진입하였습니다.');
            }
        })

    }
    else if (item.typeId == 'msdc:msdc_setting') {
        selectFunct(player)
    }
    else if (Funct_Regex.test(item.typeId)) {
        runFunct(player, parseInt(item.typeId.charAt(13)) - 1)
    }
    else if (item.typeId == 'msdc:psd_control') {
        controlPSD(player)
    }
});

/* END */