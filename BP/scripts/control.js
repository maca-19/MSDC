import { system, world, Dimension, PlayerInteractWithEntityBeforeEvent, PlayerInteractWithEntityBeforeEventSignal } from '@minecraft/server'
import { MessageFormData, ActionFormData, ModalFormData } from '@minecraft/server-ui'

const woolColorList = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black'];
const groupList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

let recentSubmittedRecord = [0, false, 1, 1];
let canSet = false;
function isNNPC(source) {
    return source.typeId == 'minecraft:player' ? true : false;
}

// world.afterEvents.entitySpawn.subscribe((data) => {
//     if (data.cause == 'Loaded') return 0;
//     else {
//         let entity = data.entity;
//         let player = world.getDimension('overworld').getPlayers({ closest: 1, tags: ['in_msdc_setting_mode'] });
//         if (entity.typeId.slice(0, 9) == 'msdc:msdc') {
//             let yRot = Math.round(player[0].getRotation().y / 90) * 90 + 180;
//             entity.setRotation({ x: 0, y: yRot })
//             entity.setRotation({ x: 0, y: yRot })
//             entity.setRotation({ x: 0, y: yRot })
//         }
//         else if (entity.typeId == 'msdc:setting') {
//             settingPSD(player[0]);
//         }
//     }
// })


// world.afterEvents.itemUse.subscribe((data) => {
//     let player = isNNPC(data.source) ? data.source : undefined;
//     let item = data.itemStack;
//     if (item.typeId == 'msdc:psd_setting' && player != undefined) {
//         if (player.hasTag('in_msdc_setting_mode')) {
//             player.removeTag('in_msdc_setting_mode');
//             player.sendMessage('MSDC >\u00A76 PSD 설정 모드에서 빠져나왔습니다.')
//             console.warn('설정 비활성화')
//         }
//         else {
//             player.addTag('in_msdc_setting_mode');
//             player.sendMessage('MSDC >\u00A7a PSD 설정 모드에 진입하였습니다.')
//             console.warn('설정 활성화')
//         }
//     }
// })


world.beforeEvents.playerInteractWithEntity.subscribe((data) => {
    console.warn('interact')
    let entity = data.target;
    let player = data.player;

    console.warn(entity)
    if (entity.isValid(hasTypeFamily('msdc_psd'))) {
        console.warn('hello')
    }
})


async function settingPSD(player, psdEntity) {

    const settingPSD = new ModalFormData()
        .title(`PSD 설정`)
        .dropdown('그룹 선택', groupList, recentSubmittedRecord[0])
        .toggle('PSD에(에서)  선택된 그룹 \u00A7c삭제\u00A7r/\u00A7a추가\u00A7r', recentSubmittedRecord[1])
        .slider('차량번호', 1, 10, 1, recentSubmittedRecord[2])
        .slider('도어번호', 1, 4, 1, recentSubmittedRecord[3])

    await settingPSD.show(player).then((response) => {
        let res = response.formValues;
        checkModified(player, res, psdEntity)
    }).catch((error) => {
        if (error == 0) {

        }
    })
}

async function checkModified(player, res, psdEntity) {
    const modal = new MessageFormData()
        .body(`그룹 ${groupList[res[0]]}${res[1] ? '로 지정' : '지정해제'}, 차량번호 ${res[2]}, 도어번호 ${res[2]} (이)가 맞습니까?`)
        .button1('아니요')
        .button2('네')
    modal.show(player).then((response) => {
        if (response.selection) {
            //player.runCommand(`scoreboard players set @e[r=1, c=1, family=msdc_psd] msdc_number ${res[2] * 10 + res[3]}`);
            psdEntity.runCommand(`event entity @s msdc:A${res[2]}`);
            player.runCommand(`event entity @e[family=msdc_psd, c=1, r=10] msdc:A${res[2]}`);
            player.runCommand(`event entity @e[family=msdc_psd, c=1, r=10] msdc:B${res[3]}`);
            player.runCommand(`tag @e[family=msdc_psd, c=1, r=10] add msdc_group${groupList[res[0]]}`)
        }
        else {
            settingPSD(player)
        }
    })
}