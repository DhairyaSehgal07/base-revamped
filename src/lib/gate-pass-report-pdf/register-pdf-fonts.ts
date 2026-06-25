import { Font } from "@react-pdf/renderer"

let fontsRegistered = false

export function registerGatePassReportPdfFonts() {
  if (fontsRegistered) return

  Font.register({
    family: "Roboto",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlfChc9AMP6lbBP.ttf",
        fontWeight: 700,
      },
    ],
  })

  fontsRegistered = true
}
