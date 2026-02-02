export default {
    title: '个人资料',
    subtitle: '管理您的个人信息和偏好设置',
    editProfile: '编辑个人资料',
    exportData: '导出数据',
    importData: '导入数据',
    sections: {
        overview: '概览',
        accountInfo: '账号信息',
        appearance: '外观',
    },
    fields: {
        fullName: '全名',
        email: '邮箱',
        avatar: '头像链接',
        theme: '主题',
    },
    stats: {
        totalScore: '总分',
        totalWords: '总单词数',
        memberSince: '注册时间',
        lastUpdated: '最后更新',
    },
    actions: {
        saveChanges: '保存更改',
        cancel: '取消',
    },
    messages: {
        updateSuccess: '个人资料更新成功',
        updateError: '更新个人资料失败',
        exportSuccess: '数据导出成功',
        exportError: '导出数据失败',
        importSuccess: '数据导入成功',
        importError: '导入数据失败',
        importNoChanges: '该数据已存在',
        importStats: '新增 {new} 个单词，更新 {updated} 个单词，跳过 {skipped} 个重复项',
    },
}
