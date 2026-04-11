module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 类型枚举：只允许这些类型
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'],
    ],
    // 类型小写
    'type-case': [2, 'always', 'lower-case'],
    // 类型不能为空
    'type-empty': [2, 'never'],
    // 范围小写
    'scope-case': [2, 'always', 'lower-case'],
    // 描述不能为空
    'subject-empty': [2, 'never'],
    // 描述结尾不要句号
    'subject-full-stop': [2, 'never', '.'],
    // 描述首字母小写
    'subject-case': [0],
    // header 最大长度
    'header-max-length': [2, 'always', 100],
  },
};
