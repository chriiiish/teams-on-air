import { generateQrData } from './QrHelpers';

describe('Given we want the QR codes to work with the NZ Covid Tracer App', () => {
    describe('When we enter data', () => {
              it('Then it should be in the right format', () => {
                const name = "TestName";
                const description = "TestDescription";
                const qrData = generateQrData(name, description);
                expect(qrData).toMatch('NZCOVIDTRACER:eyJnbG4iOiIwMDAwMDAwMCIsInZlciI6ImMxOToxIiwidHlwIjoiZW50cnkiLCJvcG4iOiJUZXN0TmFtZSIsImFkciI6IlRlc3REZXNjcmlwdGlvbiJ9')
              });
    });
  });