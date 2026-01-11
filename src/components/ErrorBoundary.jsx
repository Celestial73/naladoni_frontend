import {
  Component,
} from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static getDerivedStateFromError = (error) => ({ error });

  componentDidCatch(error) {
    this.setState({ error });
  }

  render() {
    const {
      state: {
        error,
      },
      props: {
        fallback: Fallback,
        children,
      },
    } = this;

    return 'error' in this.state
      ? typeof Fallback === 'function'
        ? <Fallback error={error} />
        : Fallback
      : children;
  }
}
