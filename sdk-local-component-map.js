import RootContainer from './src/components/PegaRootContainer';
import HybridViewContainer from '@pega/react-sdk-components/lib/components/infra/Containers/ViewContainer/ViewContainer';
import TextContent from '@pega/react-sdk-components/lib/components/field/TextContent';

const localSdkComponentMap = {
  HybridViewContainer,
  RootContainer,
  Text: TextContent
};

export default localSdkComponentMap;
