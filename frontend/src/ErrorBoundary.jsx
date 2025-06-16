import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Логируйте ошибку, если нужно
    console.error("Caught by ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Что-то пошло не так. Пожалуйста, попробуйте позже.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
