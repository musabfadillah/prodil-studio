module.exports = {
  apps: [
    {
      name: 'prodil-backend',
      script: 'src/server.js',
      cwd: '/var/www/prodil-studio/backend',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
