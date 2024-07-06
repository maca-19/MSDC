import { world, system } from '@minecraft/server'
import { MessageFormData, ActionFormData, ModalFormData } from '@minecraft/server-ui'

const woolColorList = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black'];
const groupList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
let woolColor = 0, isOpen = false;

world.beforeEvents.itemUse.subscribe(data => {
    const player = data.source;

    if (data.itemStack.typeId == 'msdc:psd_setting') {
        system.run(() => show_msdcPSD_main(player))
    }
    else if (data.itemStack.typeId == 'minecraft:recovery_compass') {
        system.run(() => show_msdcMTC(player))
    }
})

async function show_msdcPSD_main(player) {
    const msdcPSD_main = new ActionFormData()
        .title("macaPSD controll panel")
        .button('Group Setting')
        .button('Show group of nearest PSD')
        .button('Open/close Test')
    await msdcPSD_main.show(player).then((response) => {
        switch (response.selection) {
            case 0:
                show_msdcPSD_set(player)
                break;
            case 1:
                player.runCommand()
                break;
            case 2:
                show_msdcPSD_oc(player)
                break;
            default:
                break;
        }
    }).catch((error) => {
        console.error(error)
    })
}

async function show_msdcPSD_set(player) {
    const msdcPSD_set = new ModalFormData()
        .title('macaPSD setting panel')
        .dropdown('Select Group', groupList, 0)
        .toggle('Remove/Add', false)
    await msdcPSD_set.show(player).then((response) => {
        try {
            player.runCommand(`tag @e[family=maca_psd, c=1, r=32] ${response.formValues[1] ? 'add' : 'remove'} maca_psd_group${groupList[response.formValues[0]]}`)
            player.runCommand(`say \u00A76 Group ${groupList[response.formValues[0]]} \u00A7r${response.formValues[1] ? 'is \u00A72assigned\u00A7r to' : 'has been \u00A7dde-assigned\u00A7r from'} the nearest PSD`)
        }
        catch (e) {
            player.runCommand(`say \u00A7a There are no PSD within a 32 block radius.`)
        }
    }).catch((error) => {
        console.error(error)
    })
}

async function show_msdcPSD_oc(player) {
    const msdcPSD_set = new ModalFormData()
        .title('macaPSD open/close TEST panel')
        .dropdown('Select Wool', woolColorList, 0)
        .dropdown('Select Group', groupList, 0)
        .toggle('select by color/group', false)
        .slider('max PSD count', 1, 20, 1, 20)
        .toggle('Close/Open', false)
    await msdcPSD_set.show(player).then((response) => {
        if (!response.formValues[2]) player.runCommand(`execute as @e[family=maca_psd, c=${response.formValues[3]}] positioned as @s if block ~ ~-2 ~ ${woolColorList[response.formValues[0]]}_wool run tag @s ${response.formValues[4] ? 'add' : 'remove'} maca_psd_open`);
        else player.runCommand(`tag @e[family=maca_psd, tag=maca_psd_group${groupList[response.formValues[1]]}, c=${response.formValues[3]}] ${response.formValues[4] ? 'add' : 'remove'} maca_psd_open`);
    }).catch((error) => {
        console.warn(error)
    })
}

// async function show_msdcMTC(player) {
//     const msdcMTC = new ActionFormData()
//         .title("MTC controll panel")
//         .button('Door control',)
//         .button('Announcement')
//         .button('Destination set');
//     await msdcMTC.show(player).then((response) => {
//         switch (response.selection) {
//             case 0:
//                 show_msdcPSD_main(player)
//                 break;
//             case 2:
//                 show_msdcMTC_dest(player)
//                 break;
//             default:
//                 break;
//         }
//     }).catch((error) => {
//         console.error(error)
//     })
// }
//
// async function show_msdcMTC_dest(player) {
//     const msdcMTC_dest = new ModalFormData()
//         .title("MTC controll panel")
//         .slider('Dest', 1, 4, 1, 1)
//         .toggle('UP/DOWN', false);
//     await msdcMTC_dest.show(player).then((response) => {
//         player.runCommand(`/function mtc_mode${response.formValues[0] * 2 - 1 + response.formValues[1]}`)
//     }).catch((error) => {
//         console.error(error)
//     })
// }
//
// async function show_msdcMTC(player) {
//     const msdcMTC = new ActionFormData()
//         .title("MTC controll panel")
//         .button('Door control')
//         .button('Announcement')
//     await msdcMTC.show(player).then((response) => {
//         switch (response.selection) {
//             case 0:
//                 show_msdcPSD_main(player)
//                 break;
//             default:
//                 break;
//         }
//     }).catch((error) => {
//         console.error(error)
//     })
// }
