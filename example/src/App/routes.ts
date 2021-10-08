import GetStarted from '../GetStarted';
import UseValue from '../UseValue';
import UseLoading from '../UseLoading';
import UseError from '../UseError';
import SharedValue from '../SharedValue';
import ClassComponent from '../ClassComponent';
import AdvancedLoading from '../AdvancedLoading';
import RESTful from '../RESTful';
import SWR from '../SWR';
import Form from '../Form';
import AsyncValidate from '../AsyncValidate';
import LocalStorageRegion from '../LocalStorageRegion';
import MappedRegion from '../MappedRegion';

const routes = [{
  key: 'GetStarted',
  label: 'Get Started',
  groupName: 'GetStarted',
  Component: GetStarted,
}, {
  key: 'UseValue',
  label: 'useValue',
  groupName: 'Basic',
  Component: UseValue,
}, {
  key: 'UseLoading',
  label: 'useLoading',
  groupName: 'Basic',
  Component: UseLoading,
}, {
  key: 'UseError',
  label: 'useError',
  groupName: 'Basic',
  Component: UseError,
}, {
  key: 'LocalStorageRegion',
  label: 'localStorage',
  groupName: 'Basic',
  Component: LocalStorageRegion,
}, {
  key: 'MappedRegion',
  label: 'mappedRegion',
  groupName: 'Basic',
  Component: MappedRegion,
}, {
  key: 'SharedValue',
  label: 'Shared Value',
  groupName: 'Advanced',
  Component: SharedValue,
}, {
  key: 'AdvancedLoading',
  label: 'Advanced Loading',
  groupName: 'Advanced',
  Component: AdvancedLoading,
}, {
  key: 'ClassComponent',
  label: 'Class Component',
  groupName: 'Advanced',
  Component: ClassComponent,
}, {
  key: 'RESTful',
  label: 'RESTful',
  groupName: 'Advanced',
  Component: RESTful,
}, {
  key: 'SWR',
  label: 'SWR',
  groupName: 'Advanced',
  Component: SWR,
}, {
  key: 'AsyncValidate',
  label: 'Async Validate',
  groupName: 'Advanced',
  Component: AsyncValidate,
}, {
  key: 'Form',
  label: 'Form',
  groupName: 'Advanced',
  Component: Form,
}];

export default routes;
