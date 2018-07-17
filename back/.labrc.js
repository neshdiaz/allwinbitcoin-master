module.exports = {
    coverage: true,
    timeout: 0,
    lint: false,
    verbose: true,
    'coverage-exclude': [
        'server/models',
        'server/plugins'
    ],
    reporter: ['html', 'console'],
    output: ['./test/artifacts/coverage.html', process.stdout]
};
