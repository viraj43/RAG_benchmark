# Security Policy

## Reporting Security Vulnerabilities

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (optional)

## Scope
This policy applies to:
- The Kdyta Benchmark codebase
- Associated datasets
- Configuration files

## What to Expect
- Acknowledgment of your report within 48 hours
- Regular updates on the progress of fixing the vulnerability
- Credit in the security advisory (if desired)

## Out of Scope
- Social engineering attacks
- Physical security
- Denial of service attacks on third-party APIs

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Best Practices for Users

When running this benchmark:
- Store your API keys securely
- Never commit `.env` files to version control
- Rotate API keys periodically
- Use environment variables for sensitive data