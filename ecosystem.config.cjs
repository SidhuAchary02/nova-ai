module.exports = {
  apps: [
    {
      name: "nova-heavy-generation-worker",
      script: "npm",
      args: "run worker:heavy-generation",
      cwd: __dirname,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_restarts: 20,
      min_uptime: "10s",
      time: true,
      env: {
        NODE_ENV: "production",
        HEAVY_GENERATION_INLINE_WORKER: "false",
        DATABASE_POOL_MAX: "2",
      },
    },
  ],
};
