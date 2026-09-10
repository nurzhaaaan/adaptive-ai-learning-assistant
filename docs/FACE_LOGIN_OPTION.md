# Optional Face / Biometric Login

For a production web application, do not store raw face photos and compare them manually. A safer extension is WebAuthn/passkeys, where the device can use Face ID, Touch ID or another local biometric method and the server stores only public-key credentials.

This repository keeps email/password + JWT as the working authentication method. Face/biometric login is intentionally documented as an extension rather than implemented as an insecure webcam demo.
