import 'package:flutter/foundation.dart';

class ApiConfig {
  ApiConfig._();

  // backend-nest currently uses PORT=4000 in backend-nest/.env.
  static const androidEmulatorBaseUrl = 'http://10.0.2.2:4000';
  static const webLocalBaseUrl = 'http://localhost:4000';
  static const realPhoneBaseUrl = 'http://YOUR_PC_IP:4000';
  static const productionBaseUrl = 'https://api.yourdomain.com';

  static const _configuredBaseUrl = String.fromEnvironment('RUROX_API_URL');

  static String get baseUrl {
    if (_configuredBaseUrl.isNotEmpty) return _configuredBaseUrl;
    return kIsWeb ? webLocalBaseUrl : androidEmulatorBaseUrl;
  }
}
