import { world } from '@minecraft/server'
import { MessageFormData, ActionFormData, ModalFormData, FormRejectReason, FormCancelationReason } from '@minecraft/server-ui';
import { MAX_PSD_COUNT, ANIMATIONS_TO_USE } from '../settings.js'
const groupList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const functKeys = ['open', 'close', 'lcd_on', 'lcd_off', 'custom1', 'custom2', 'custom3', 'custom4'].concat(ANIMATIONS_TO_USE)
let lastSetting = [0, false, 1, 1];
let lastFunctSettings = [
    ['', 20, 0],
    ['', 20, 0],
    ['', 20, 0],
    ['', 20, 0],
    ['', 20, 0],
    ['', 20, 0],
    ['', 20, 0],
    ['', 20, 0]
]
let funcData = new Array(8)
class Funct {
    constructor(group, count, funct) {
        this.group = group;
        this.count = count;
        this.funct = funct;
    }
    runFunct(player) {
        let entities = world.getDimension(player.dimension.id).getEntities({ location: player.location, families: ['msdc_psd'] });
        let count = 0
        for (let i of entities) {
            if (!this.group.some(value => value == '')) {
                for (let j of i.getTags()) {
                    if (/^msdc_group[A-Za-z]$/.test(j) && this.group.includes(j.charAt(10))) {
                        count++;
                        i.triggerEvent(`msdc:${this.funct}`)
                        break;
                    }
                }
            }
            else {
                count++;
                i.triggerEvent(`msdc:${this.funct}`)
            }
            if (count == this.count) break;
        }
    }
}
function updateGroups(index, shouldAdd, existingGroups) {
    const targetGroup = groupList[index]; // res[0] 인덱스에 해당하는 그룹

    existingGroups = existingGroups.sort();
    let originalGroups = existingGroups;
    let con = originalGroups.length === 0 ? '\u00a7dno group\u00a7r' : originalGroups.join(' ');

    if (shouldAdd) {
        if (!existingGroups.includes(targetGroup))
            existingGroups = existingGroups.concat(targetGroup);
    } else {
        existingGroups = existingGroups.filter(item => item !== targetGroup);
    }

    existingGroups = existingGroups.sort();
    let updated = existingGroups
    con += ' -> ';

    if (updated.length === 0) {
        con += '\u00a7dno group\u00a7r';
    }
    else {
        con += updated.join(' ');
    }

    if (originalGroups.length != updated.length) {
        con = con.replace(targetGroup, `\u00a7e ${targetGroup} \u00a7r`)
    }

    return con;
}



async function settingPSD(player, psd) {
    const form = new ModalFormData()
        .title({ translate: 'script.form.settingPSD.title' })
        .dropdown({ translate: 'script.form.settingPSD.dropdown1' }, groupList, lastSetting[0])
        .toggle({ translate: 'script.form.settingPSD.toggle1' }, lastSetting[1])
        .slider({ translate: 'script.form.settingPSD.slider1' }, 1, 10, 1, lastSetting[2])
        .slider({ translate: 'script.form.settingPSD.slider2' }, 1, 4, 1, lastSetting[3])

    await form.show(player).then(response => {
        if (response.canceled) return 0
        checkModified(player, response.formValues, psd);
    }).catch(error => {

    });
}

async function checkModified(player, res, psd) {
    let con = 'group: ';
    let group1 = []
    for (let i of psd.getTags()) {
        if (/^msdc_group[A-Za-z]$/.test(i)) {
            group1 = group1.concat(i.charAt(10))
        }
    }
    con += updateGroups(res[0], res[1], group1) + '\n\n' + 'numberA: \u00a7e' + res[2] + '\u00a7r  numberB: \u00a7e' + res[3]

    const form = new MessageFormData()
        .title({ translate: 'script.form.checkModified.title' })
        .body(con)
        .button1({ translate: 'script.form.checkModified.button1' })
        .button2({ translate: 'script.form.checkModified.button2' })
    await form.show(player).then(response => {
        if (response.canceled) {
            return 0;
        }
        if (response.selection) {
            psd.triggerEvent(`msdc:A${res[2]}`);
            psd.triggerEvent(`msdc:B${res[3]}`);
            if (res[1]) {
                psd.addTag(`msdc_group${groupList[res[0]]}`);
            }
            else {
                psd.removeTag(`msdc_group${groupList[res[0]]}`);
            }
            lastSetting = res;
            player.sendMessage('명령이 전달되었습니다');
        } else {
            settingPSD(player, psd);
        }
    }).catch(error => {

    });
}

async function selectFunct(player) {
    const form = new ActionFormData()
        .title({ translate: 'script.form.selectFunct.title' })
        .body({ translate: 'script.form.selectFunct.body' });
    for (let i = 0; i < 8; i++) {
        form.button(`${i + 1}`);
    }
    await form.show(player).then(response => {
        editFunct(player, response.selection)
    }).catch(error => {
    });
}

async function editFunct(player, selectedFunctionId) {
    const form = new ModalFormData()
        .title({ translate: 'script.form.editFunct.title' })
        .textField({ translate: 'script.form.editFunct.textField1' }, { translate: 'script.form.editFunct.textField1_hint' }, lastFunctSettings[selectedFunctionId][0])
        .slider({ translate: 'script.form.editFunct.slider1' }, 1, MAX_PSD_COUNT, 1, lastFunctSettings[selectedFunctionId][1])
        .dropdown({ translate: 'script.form.editFunct.dropdown1' }, functKeys, lastFunctSettings[selectedFunctionId][2])
    await form.show(player).then(response => {
        if (response.canceled) {
            player.sendMessage({ translate: 'script.form.editFunct.message_error' })
            selectFunct(player)
        }
        const res = response.formValues
        if (res) {
            if (res.toString() == lastFunctSettings[selectedFunctionId].toString() && funcData[selectedFunctionId]) {
                player.sendMessage({ translate: 'script.form.editFunct.message_nochanges' })
                return 0;
            }
            if (/^([A-Za-z]\s)*[A-Za-z]$/.test(res[0]) || res[0] == '') {
                const f = new Funct(res[0].toUpperCase().split(' '), res[1], functKeys[res[2]]);
                funcData[selectedFunctionId] = f
                lastFunctSettings[selectedFunctionId] = res
                player.sendMessage({ translate: `script.form.editFunct.message_ok_${selectedFunctionId + 1}` })
                return 0;
            }
            else {
                new MessageFormData().body({ translate: 'script.form.editFunct.errorForm.body' }).button1('ok').button2('ok').show(player);
                player.sendMessage({ translate: 'script.message.error.not_match_regular_expression' })
                return 0;
            }
        }

    }).catch(error => {
    });
}

function runFunct(player, functID) {
    if (funcData[functID]) {
        funcData[functID].runFunct(player)
    }
    else {
        player.sendMessage({ translate: 'script.message.error.function_undefined' })
    }
}

async function controlPSD(player) {
    const form = new ModalFormData()
        .title({ translate: 'script.form.editFunct.title' })
        .textField({ translate: 'script.form.editFunct.textField1' }, { translate: 'script.form.editFunct.textField1_hint' })
        .slider({ translate: 'script.form.editFunct.slider1' }, 1, 20, 1)
        .dropdown({ translate: 'script.form.editFunct.dropdown1' }, functKeys)
    await form.show(player).then(response => {
        const res = response.formValues
        if (/^([A-Za-z]\s)*[A-Za-z]$/.test(res[0]) || res[0] == '') {
            new Funct(res[0].toUpperCase().split(' '), res[1], functKeys[res[2]]).runFunct(player);
            player.sendMessage('\u00a7a선택된 작업이 실행되었습니다')
        }
        else {
            return -1
        }

    }).catch(error => {

    });
}

export { selectFunct, editFunct, settingPSD, controlPSD, runFunct };