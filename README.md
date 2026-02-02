# Pegasus - Web3 DApp

一个现代化的 Web3 去中心化应用，支持多链钱包连接和 ERC20 代币转账。

## 功能特性

### 钱包连接
- 支持 **EIP-6963** 标准的钱包自动检测
- 兼容传统钱包注入方式（`window.ethereum`）
- 支持多种主流钱包：MetaMask、OKX Wallet、Coinbase Wallet 等
- 钱包列表预加载，点击即开弹窗，体验流畅

### 多链支持

**主网 (9 条)**
| 网络 | 原生代币 |
|------|---------|
| Ethereum | ETH |
| Polygon | POL |
| Arbitrum One | ETH |
| Optimism | ETH |
| BNB Smart Chain | BNB |
| Base | ETH |
| Avalanche C-Chain | AVAX |
| zkSync Era | ETH |
| Linea | ETH |

**测试网 (9 条)**
| 网络 | 原生代币 |
|------|---------|
| Sepolia | ETH |
| Polygon Amoy | POL |
| Arbitrum Sepolia | ETH |
| Optimism Sepolia | ETH |
| BSC Testnet | tBNB |
| Base Sepolia | ETH |
| Avalanche Fuji | AVAX |
| zkSync Sepolia | ETH |
| Linea Sepolia | ETH |

### 账户信息
- 显示钱包地址与 ENS 域名
- 展示原生代币余额
- 自动获取 ERC20 代币持仓列表
- 一键复制地址

### 代币转账
- 支持任意 ERC20 代币转账
- 自动识别代币精度（decimals）
- 智能检测合约地址有效性
- 交易状态实时反馈

### 网络切换
- 支持在已连接网络间无缝切换
- 自动添加未配置的网络
- 网络状态实时同步

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite (rolldown-vite)
- **UI 组件**: Ant Design 6
- **Web3 库**: ethers.js 6
- **样式**: Less + CSS Modules

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

## 项目结构

```
src/
├── components/          # 组件目录
│   ├── AccountCard/     # 账户卡片
│   ├── Header/          # 页面头部
│   ├── Logo/            # Logo 组件
│   ├── NetworkIcon/     # 网络图标
│   ├── NetworkSelector/ # 网络选择器
│   ├── TransferForm/    # 转账表单
│   ├── WalletModal/     # 钱包选择弹窗
│   └── WelcomeSection/  # 欢迎页面
├── constants/           # 常量配置
│   ├── abi.ts           # 合约 ABI
│   ├── icons.tsx        # 网络图标
│   ├── networks.ts      # 网络配置
│   ├── recommendedWallets.ts  # 推荐钱包
│   ├── tokens.ts        # 代币配置
│   └── walletIcons.tsx  # 钱包图标
├── hooks/               # 自定义 Hooks
│   ├── useWallet.ts     # 钱包管理
│   └── useTransaction.ts # 交易处理
├── styles/              # 全局样式
├── types/               # TypeScript 类型
├── utils/               # 工具函数
└── App.tsx              # 应用入口
```

## 使用说明

1. **连接钱包**: 点击页面右上角 "Connect Wallet" 按钮，选择已安装的钱包进行连接
2. **切换网络**: 连接钱包后，使用网络选择器切换到目标网络
3. **查看资产**: 账户卡片会展示当前网络上的原生代币和 ERC20 代币余额
4. **发送代币**: 
   - 填写代币合约地址（或点击代币列表中的代币自动填充）
   - 输入接收地址
   - 输入转账数量
   - 点击 "Send Transaction" 发起交易

## 开发说明

### 性能优化

项目采用了多项性能优化措施：

- 使用 `React.memo` 包裹纯展示组件，避免不必要的重渲染
- 使用 `useCallback` 和 `useMemo` 缓存回调函数和计算结果
- 钱包检测逻辑前置到 Hook 初始化阶段，确保弹窗即时响应
- 静态数据提取到组件外部，避免重复创建

### 添加新网络

在 `src/constants/networks.ts` 中添加网络配置：

```typescript
'0x...': {
  chainId: '0x...',
  chainName: 'Network Name',
  shortName: 'Short',
  nativeCurrency: { name: 'Token', symbol: 'TKN', decimals: 18 },
  rpcUrls: ['https://rpc.example.com'],
  blockExplorerUrls: ['https://explorer.example.com'],
  iconKey: 'networkKey',
  iconColor: '#FFFFFF',
  isTestnet: false,
}
```

## License

MIT
