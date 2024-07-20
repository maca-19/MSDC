import { system, world, Dimension } from '@minecraft/server';
import { MessageFormData, ActionFormData, ModalFormData } from '@minecraft/server-ui';

const groupList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const functKeys = ['open', 'close', 'lcd_on', 'lcd_off']
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
let funcData = new Array(8);
const PSD_Regex = /^msdc:msdc\d{4}.*$/;
const Funct_Regex = /^msdc:function\d{1}$/;

class Funct {
    constructor(group = [false], count = 20, funct = 'open') {
        this.group = group;
        this.count = count;
        this.funct = funct;
    }
    runFunct(player) {
        console.warn(this.group)
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

async function settingPSD(player, psd) {
    const form = new ModalFormData()
        .title(`PSD 설정`)
        .dropdown('그룹 선택', groupList, lastSetting[0])
        .toggle('PSD에(에서) 선택된 그룹 \u00A7c삭제\u00A7r/\u00A7a추가\u00A7r', lastSetting[1])
        .slider('차량번호', 1, 10, 1, lastSetting[2])
        .slider('도어번호', 1, 4, 1, lastSetting[3]);

    try {
        const response = await form.show(player);
        const res = response.formValues;
        checkModified(player, res, psd);
    } catch (error) {
        // Handle error
    }
}

async function checkModified(player, res, psd) {
    const form = new MessageFormData()
        .title('Modified')
        .body(`그룹 ${groupList[res[0]]}${res[1] ? '로 지정' : '지정해제'}, 차량번호 ${res[2]}, 도어번호 ${res[3]} (이)가 맞습니까?`)
        .button1('아니요, 변경사항을 폐기합니다.')
        .button2('네, 변경사항을 저장합니다.');

    try {
        const response = await form.show(player);
        if (response.selection) {
            psd.triggerEvent(`msdc:A${res[2]}`);
            psd.triggerEvent(`msdc:A${res[2]}`);
            psd.triggerEvent(`msdc:B${res[3]}`);
            psd.addTag(`msdc_group${groupList[res[0]]}`);
            lastSetting = res;
            player.sendMessage('명령이 전달되었습니다');
        } else {
            settingPSD(player, psd);
        }
    } catch (error) {
        // Handle error
    }
}

function getGroup(psd, check = false) {
    const typeFamily = psd.getComponent("minecraft:type_family").getTypeFamily();
    const groupReturn = [];

    if (typeFamily.includes('msdc_psd')) {
        for (const type of typeFamily) {
            groupReturn.push(type);
        }
        return check ? groupReturn.includes(check) : groupReturn;
    }
}

async function selectFunct(player) {
    const form = new ActionFormData()
        .title('Setting Function')
        .body('choose what you want to change');
    for (let i = 0; i < 8; i++) {
        form.button(`function ${i + 1}`);
    }
    await form.show(player).then(response => {
        editFunct(player, response.selection)
    }).catch(error => {
        console.warn(`Error showing form: ${error}`);
    });
}

async function editFunct(player, selectedFunctionId) {
    const form = new ModalFormData()
        .title(`edit function${selectedFunctionId + 1}`)
        .textField('그룹', '아래 설정을 적용 하려는 그룹들을 띄어쓰기로 구분하여 입력하세요.', lastFunctSettings[selectedFunctionId][0])
        .slider('선택할 PSD의 수', 1, 20, 1, lastFunctSettings[selectedFunctionId][1])
        .dropdown('기능', functKeys, lastFunctSettings[selectedFunctionId][2])
    await form.show(player).then(response => {
        const res = response.formValues
        if (/^([A-Za-z]\s)*[A-Za-z]$/.test(res[0]) || res[0] == '') {
            const f = new Funct(res[0].toUpperCase().split(' '), res[1], functKeys[res[2]]); funcData[selectedFunctionId] = f;
            lastFunctSettings[selectedFunctionId] = res
            player.sendMessage('\u00a7afunction' + (parseInt(selectedFunctionId) + 1) + '(이)가 저장되었습니다')
        }
        else {
            new MessageFormData().body('그룹은 영어 알파벳으로만, 띄어쓰기로 구분하여 입력해야 합니다\n예시: \'a\' , \'a B R\'\n\n > 아무거나 누르세요').button1('ok').button2('ok').show(player);
            player.sendMessage('\u00a7cfunction' + (parseInt(selectedFunctionId) + 1) + '(이)가 저장되지 않았습니다')
            return -1
        }

    }).catch(error => {
        console.warn(`Error showing form: ${error}`);
        player.sendMessage('\u00a7cfunction' + (parseInt(selectedFunctionId) + 1) + '(이)가 저장되지 않았습니다')
        selectFunct(player)
    });
}

async function controlPSD(player) {
    const form = new ModalFormData()
        .title('control PSD')
        .textField('그룹', '아래 설정을 적용 하려는 그룹들을 띄어쓰기로 구분하여 입력하세요.')
        .slider('선택할 PSD의 수', 1, 20, 1)
        .dropdown('기능', functKeys)
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

world.afterEvents.entitySpawn.subscribe(data => {
    if (data.cause === 'Loaded') return;

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
        if (player.hasTag('in_msdc_setting_mode')) {
            player.removeTag('in_msdc_setting_mode');
            player.sendMessage('MSDC >\u00A76 PSD 설정 모드에서 빠져나왔습니다.');
        } else {
            player.addTag('in_msdc_setting_mode');
            player.sendMessage('MSDC >\u00A7a PSD 설정 모드에 진입하였습니다.');
        }
    }
    else if (item.typeId == 'msdc:msdc_setting') {
        selectFunct(player)
    }
    else if (Funct_Regex.test(item.typeId)) {
        if (funcData[parseInt(item.typeId.charAt(13)) - 1]) {
            funcData[parseInt(item.typeId.charAt(13)) - 1].runFunct(player)
        }
        else {
            console.warn('\u00a7c선택한 function 이 설정되어 있지 않음')
        }
    }
    else if (item.typeId == 'msdc:psd_control') {
        controlPSD(player)
    }
});


/* END */