# Contributing to Kdyta Benchmark

Thank you for your interest in contributing!

## How to Contribute

### Reporting Issues
- Use GitHub Issues to report bugs or suggest features
- Include steps to reproduce if reporting a bug
- Search existing issues before creating new ones

### Pull Requests
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests if applicable
5. Commit with clear, descriptive messages
6. Push to your fork and submit a PR

### Adding New Search Providers
To add a new provider:
1. Create a new client class in `src/clients/providers.js`
2. Extend the `BaseClient` class
3. Implement the `search(query)` method
4. Add provider configuration in `src/config/index.js`
5. Update this README with the new provider

### Running the Benchmark
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your API keys to .env

# Run the benchmark
npm start
```

## Code Style
- Use ES6+ syntax
- Use 2 spaces for indentation
- Add comments for complex logic

## License
By contributing, you agree that your contributions will be licensed under the MIT License.