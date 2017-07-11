const Builder = require('../../../main/javascript/Manifest/Builder');
const Manifest = require('../../../main/javascript/Manifest/Manifest');

const manifestJson210 = require.resolve('../../resources/valid-app-manifest-v2.1.0.manifest.json');
const packageJson210 = require.resolve('../../resources/valid-app-manifest.package-v2.1.0.json');

test('can build from src', done =>
{
  const manifests = [
    {
      name: "manifest.json",
      path: manifestJson210
    },
    {
      name: "package.json",
      path: packageJson210
    },
  ].map((src) => new Builder().setPropsFromSource(src).build());


  manifests.forEach((manifest) => expect(manifest instanceof Manifest).toEqual(true));
  done();
});
