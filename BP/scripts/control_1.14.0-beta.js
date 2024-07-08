import { system, world, Dimension } from '@minecraft/server'
import { MessageFormData, ActionFormData, ModalFormData } from '@minecraft/server-ui'

const groupList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
let recentSubmittedRecord = [0, false, 1, 1];

async function settingPSD(player, psd) {
    const form = new ModalFormData()
        .title(`PSD 설정`)
        .dropdown('그룹 선택', groupList, recentSubmittedRecord[0])
        .toggle('PSD에(에서)  선택된 그룹 \u00A7c삭제\u00A7r/\u00A7a추가\u00A7r', recentSubmittedRecord[1])
        .slider('차량번호', 1, 10, 1, recentSubmittedRecord[2])
        .slider('도어번호', 1, 4, 1, recentSubmittedRecord[3])

    await form.show(player).then((response) => {
        let res = response.formValues;
        checkModified(player, res, psd)
    }).catch((error) => {
    })
}

async function checkModified(player, res, psd) {
    const form = new MessageFormData()
        .body(`그룹 ${groupList[res[0]]}${res[1] ? '로 지정' : '지정해제'}, 차량번호 ${res[2]}, 도어번호 ${res[2]} (이)가 맞습니까?`)
        .button1('아니요')
        .button2('네')

    await form.show(player).then((response) => {
        if (response.selection) {
            psd.triggerEvent(`msdc:A${res[2]}`)
            psd.triggerEvent(`msdc:A${res[2]}`)
            psd.triggerEvent(`msdc:B${res[3]}`)
            psd.addTag(`msdc_group${groupList[res[0]]}`)
        }
        else {
            settingPSD(player, psd)
        }
    })
}


world.afterEvents.entitySpawn.subscribe((data) => {
    if (data.cause == 'Loaded') return 0;
    else {
        let entity = data.entity;
        let player = world.getDimension('overworld').getPlayers({ closest: 1, tags: ['in_msdc_setting_mode'] });
        if (entity.typeId.slice(0, 9) == 'msdc:msdc') {
            let yRot = Math.round(player[0].getRotation().y / 90) * 90 + 180;
            entity.setRotation({ x: 0, y: yRot })
            entity.setRotation({ x: 0, y: yRot })
            entity.setRotation({ x: 0, y: yRot })
        }
    }
})

world.afterEvents.itemUse.subscribe((data) => {
    let player = data.source;
    let item = data.itemStack;
    if (item.typeId == 'msdc:psd_setting' && player != undefined) {
        if (player.hasTag('in_msdc_setting_mode')) {
            player.removeTag('in_msdc_setting_mode');
            player.sendMessage('MSDC >\u00A76 PSD 설정 모드에서 빠져나왔습니다.')
            console.warn('설정 비활성화')
        }
        else {
            player.addTag('in_msdc_setting_mode');
            player.sendMessage('MSDC >\u00A7a PSD 설정 모드에 진입하였습니다.')
            console.warn('설정 활성화')
        }
    }
})

world.beforeEvents.playerInteractWithEntity.subscribe((data) => {
    let entity = data.target;
    let player = data.player;

    if (entity.getComponent("minecraft:type_family").hasTypeFamily('msdc_psd')) {
        settingPSD(player, entity);
    }
})