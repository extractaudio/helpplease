import { describe, expect, it } from 'vitest'
import capacitorConfig from '../../capacitor.config'
import packageJson from '../../package.json'

describe('Android packaging contract', () => {
  it('uses the approved Android identity and bundled Vite output', () => {
    expect(capacitorConfig).toMatchObject({
      appId: 'com.montanapqh.team',
      appName: 'Montana PQH Team',
      webDir: 'dist'
    })
  })

  it('exposes repeatable sync and debug APK commands', () => {
    expect(packageJson.scripts['android:sync']).toBe('npm run build && cap sync android')
    expect(packageJson.scripts['android:apk']).toBe('npm run android:sync && cd android && gradlew.bat assembleDebug')
  })
})
