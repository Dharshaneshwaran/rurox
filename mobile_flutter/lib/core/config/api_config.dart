class ApiConfig {
  ApiConfig._();

  // backend-nest currently uses PORT=4000 in backend-nest/.env.
  static const androidEmulatorBaseUrl = 'http://10.0.2.2:4000';
  static const realPhoneBaseUrl = 'http://YOUR_PC_IP:4000';
  static const productionBaseUrl = 'https://api.yourdomain.com';

  static const baseUrl = String.fromEnvironment(
    'RUROX_API_URL',
    defaultValue: androidEmulatorBaseUrl,
  );
}
