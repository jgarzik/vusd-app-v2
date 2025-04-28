export const VUSD_ABI = [
  // ERC20 Standard
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint amount) returns (bool)",
  "function transferFrom(address sender, address recipient, uint amount) returns (bool)",
  
  // VUSD Specific
  "function minter() view returns (address)",
  "function treasury() view returns (address)",
  "function governor() view returns (address)",
  "function mint(address to, uint256 amount) external",
  "function multiTransfer(address[] calldata recipients, uint256[] calldata amounts) external returns (bool)",
  
  // ERC20 Events
  "event Transfer(address indexed from, address indexed to, uint amount)",
  "event Approval(address indexed owner, address indexed spender, uint amount)",
  
  // VUSD Events
  "event UpdatedMinter(address indexed previousMinter, address indexed newMinter)",
  "event UpdatedTreasury(address indexed previousTreasury, address indexed newTreasury)"
];
