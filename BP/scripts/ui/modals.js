
// const woolColorList = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black'];
// const groupList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
// let woolColor = 0, isOpen = false;

class Modals {
    settingPSD(player, psd) {
        const form = new ModalFormData()
            .title(`PSD 설정`)
            .dropdown('그룹 선택', groupList, recentSubmittedRecord[0])
            .toggle('PSD에(에서)  선택된 그룹 \u00A7c삭제\u00A7r/\u00A7a추가\u00A7r', recentSubmittedRecord[1])
            .slider('차량번호', 1, 10, 1, recentSubmittedRecord[2])
            .slider('도어번호', 1, 4, 1, recentSubmittedRecord[3])

        form.show(player).then((response) => {
            let res = response.formValues;
            checkModified(player, res, psd)
        }).catch((error) => {
        })
    }
}