<p align="center">
  <img src="assets/opencode-icon.svg" alt="Opencode Patch - opencode CLI 离线补丁" width="128" />
</p>

<p align="center">
  <a href="https://github.com/kuldeep7ke/opencodemeva"><img src="https://img.shields.io/github/stars/kuldeep7ke/opencodemeva?style=flat&logo=github" alt="Stars" /></a>
  <a href="https://github.com/kuldeep7ke/opencodemeva/network/members"><img src="https://img.shields.io/github/forks/kuldeep7ke/opencodemeva?style=flat&logo=github" alt="Forks" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license" /></a>
</p>

# Opencode Patch

你的 opencode 终端将获得一个**完整团队**——68 个专用智能体、292 个技能、94 个命令、
122 条规则、24 个护栏钩子、31 个 MCP 预设——全部离线运行，全部安装在 `~/.config/opencode`。

```text
install → delegate → review → verify → done
```

无账号、无云端、无锁定，所有内容都留在你的机器上。

你现在可以使用 68 个代理、292个技能和94个命令，另外还有钩子、规则、记忆与 MCP 预设。

| 内容 | 数量 | 说明 |
|------|------|------|
| Agents 智能体 | 68 | 规划、评审、构建修复、安全、架构与各语言专家 |
| Skills 技能 | 292 | TDD、研究、安全、文档、前端、数据、ML、运维等 |
| Commands 命令 | 94 | 每个工作流的便捷入口 |
| Rules 规则 | 122 | 各技术栈编码规范 |
| Hooks 钩子 | 24 | 护栏：安全、校验、上下文管理 |
| MCP 预设 | 31 | 开箱即用的服务配置 |

### v2.2.1 当前版本

当前版本 2.2.1（[更新日志](./CHANGELOG.md)，[发布页](https://github.com/kuldeep7ke/opencodemeva/releases)）。

## 安装

### Windows (10/11)

从 [GitHub Releases](https://github.com/kuldeep7ke/opencodemeva/releases/latest)
下载最新 `.exe` 并运行，一键将补丁应用到你的 opencode 配置。

### Ubuntu / Debian

```bash
sudo apt install ./opencodemeva-patch.deb
opencodemeva-patch
```

### 从源码构建（任意系统）

```bash
git clone https://github.com/kuldeep7ke/opencodemeva
cd opencodemeva
npm install
npm run build:opencode
npx opencode-patch install
```

## 快速开始

```bash
opencode

@planner "Add user authentication with OAuth"
@code-reviewer
@security-reviewer

/plan "Add auth"
/code-review
```

## 记忆与 MCP 服务

用记忆库跨会话保留上下文：

```bash
opencode-patch memory init
opencode-patch memory search "auth decision"
```

通过可选的本地 stdio 服务器向 MCP 客户端暴露记忆库：

```bash
npm install -g opencode-patch
opencode-patch-memory-mcp
```

## 卸载

```bash
npx opencode-patch uninstall --dry-run
npx opencode-patch uninstall
```

恢复你原来的 opencode 配置。

英文完整文档见 [README.md](./README.md)。链接：

- **GitHub:** https://github.com/kuldeep7ke/opencodemeva
- **Issues:** https://github.com/kuldeep7ke/opencodemeva/issues
- **Releases:** https://github.com/kuldeep7ke/opencodemeva/releases

## License

MIT — 见 [LICENSE](LICENSE)。
