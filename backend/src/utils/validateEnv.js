export const required = (keys) => {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error("Missing env:", missing.join(", "));
    process.exit(1);
  }
};

