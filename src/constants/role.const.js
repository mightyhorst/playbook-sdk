const RoleEnum = {
    ADMIN: "ADMIN",
    OWNER: "OWNER",
    WRITER: "WRITER",
    READER: "READER"
}

const CascadingRoleEnum = {
    ADMIN : [
        RoleEnum.ADMIN,
        RoleEnum.OWNER,
        RoleEnum.WRITER,
        RoleEnum.READER
    ],
    OWNER : [
        RoleEnum.OWNER,
        RoleEnum.WRITER,
        RoleEnum.READER
    ],
    WRITER : [
        RoleEnum.WRITER,
        RoleEnum.READER
    ],
    READER : [
        RoleEnum.READER
    ]
}

module.exports = {
    RoleEnum,
    CascadingRoleEnum
}