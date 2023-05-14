import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

/// @param _owner Address of the  owner
/// @param _avatar Address of the avatar (e.g. a Safe)
/// @param _target Address of the contract that will call exec function
/// @param _amb Address of the AMB contract
/// @param _controller Address of the authorized controller contract on the other side of the bridge
/// @param _chainId Address of the authorized chainId from which owner can initiate transactions

const FirstAddress = "0x0000000000000000000000000000000000000001";
const avatar = "0x101b4C436df747B24D17ce43146Da52fa6006C36";
const target = "0x1c82e12bfe5b782e1238b711b152beb786ce4ed4";
const chainId = 10;

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;
  // const chainId = formatBytes32String("0");
  const args = [
    FirstAddress,
    avatar,
    target,
    FirstAddress,
    FirstAddress,
    chainId,
  ];

  await deploy("AMBModule", {
    from: deployer,
    args,
    log: true,
    deterministicDeployment: true,
  });
};

deploy.tags = ["amb-module"];
export default deploy;
