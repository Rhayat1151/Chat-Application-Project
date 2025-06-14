import './detail.css'
import { useUserStore } from '../../lib/useStore'

const Detail = () => {
  const { handleLogout } = useUserStore()

  const onLogout = async () => {
    try {
      await handleLogout()
      // The App component will automatically show Login when currentUser becomes null
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className='detail'>
      <div className="user">
        <img src="avatar.png" alt="User avatar" />
        <h2>John Lee</h2>
        <p>This is heck of a guy.</p>
      </div>

      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="arrowUp.png" alt="Toggle" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Privacy & Help</span>
            <img src="arrowUp.png" alt="Toggle" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src="arrowDown.png" alt="Toggle" />
          </div>
          <div className="photos">
            <div className="photoitem">
              <div className="photodetail">
                <img src="Screenshot from 2025-06-12 07-36-58.png" alt="Shared photo" />
                <span>Img-5413</span>
              </div>
            </div>
            <div className="photoitem">
              <div className="photodetail">
                <img src="Screenshot from 2025-06-12 07-36-58.png" alt="Shared photo" />
                <span>Img-5414</span>
              </div>
            </div>

            <div className="photoitem">
              <div className="photodetail">
                <img src="Screenshot from 2025-06-12 07-36-58.png" alt="Shared photo" />
                <span>Img-5416</span>
              </div>
            </div>
            <img src="download.png" alt="Download all" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="arrowUp.png" alt="Toggle" />
          </div>
        </div>

        <button>Block User</button>
        <button className='logout' onClick={onLogout}>Logout</button>
      </div>
    </div>
  )
}

export default Detail;