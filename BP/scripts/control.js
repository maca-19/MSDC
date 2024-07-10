import { system, world, Dimension } from '@minecraft/server'
import { MessageFormData, ActionFormData, ModalFormData } from '@minecraft/server-ui'
const groupList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
let lastSetting = [0, false, 1, 1]

function settingPSD(player, psd) {
    const form = new ModalFormData()
        .title(`PSD 설정`)
        .dropdown('그룹 선택', groupList, lastSetting[0])
        .toggle('PSD에(에서)  선택된 그룹 \u00A7c삭제\u00A7r/\u00A7a추가\u00A7r', lastSetting[1])
        .slider('차량번호', 1, 10, 1, lastSetting[2])
        .slider('도어번호', 1, 4, 1, lastSetting[3])

    form.show(player).then((response) => {
        let res = response.formValues;
        checkModified(player, res, psd)
    }).catch((error) => {
    })
}
function checkModified(player, res, psd) {
    const form = new MessageFormData()
        .body(`그룹 ${groupList[res[0]]}${res[1] ? '로 지정' : '지정해제'}, 차량번호 ${res[2]}, 도어번호 ${res[3]} (이)가 맞습니까?`)
        .button1('아니요, 변경사항을 폐기합니다.')
        .button2('네, 변경사항을 저장합니다.')

    form.show(player).then((response) => {
        if (response.selection) {
            psd.triggerEvent(`msdc:A${res[2]}`)
            psd.triggerEvent(`msdc:A${res[2]}`)
            psd.triggerEvent(`msdc:B${res[3]}`)
            psd.addTag(`msdc_group${groupList[res[0]]}`)
            lastSetting = res
            player.sendMessage('명령이 전달되었습니다')
        }
        else {
            settingPSD(player, psd)
        }
    })
}
function getGroup(psd, check = false) {
    psd.getComponent("minecraft:type_family").hasTypeFamily('msdc_psd')
    group_return = []
    if (psd.getComponent("minecraft:type_family").hasTypeFamily('msdc_psd')) {
        for (i of psd.getComponent("minecraft:type_family").getTypeFamily()) {
            group_return.push(i)
        }
        if (check) return group_return.includes(check)
        else return group_return
    }
}
function openAndClose(player, funcID = 0) {
    let psd = world.getDimension(player.dimension.id).getEntities({ location: player.location, closest: 1, })[0]
    switch (funcID) {
        case 1:

    }
}


world.afterEvents.entitySpawn.subscribe((data) => {
    if (data.cause == 'Loaded') return 0;
    else {
        let entity = data.entity;
        let player = world.getDimension(entity.dimension.id).getPlayers({ location: entity.location, closest: 1, })[0]
        if (entity.typeId.slice(0, 9) == 'msdc:msdc') {
            let yRot = Math.round(player.getRotation().y / 90) * 90 + 180;
            entity.setRotation({ x: 0, y: yRot })
            entity.setRotation({ x: 0, y: yRot })
            entity.setRotation({ x: 0, y: yRot })
        }
        else if (entity.typeId == 'msdc:setting') {
            let psd = world.getDimension(entity.dimension.id).getEntities({ location: entity.location, closest: 1, })[0]
            settingPSD(player, psd)
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


// world.beforeEvents.playerInteractWithEntity.subscribe((data) => {
//     let entity = data.target;
//     let player = data.player;

//     if (entity.getComponent("minecraft:type_family").hasTypeFamily('msdc_psd')) {
//         settingPSD(player, entity);
//     }
// })