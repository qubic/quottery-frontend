const formatString = (string: number) => {
  return string ? string.toLocaleString('en-US') : '0';
};

export { formatString };
