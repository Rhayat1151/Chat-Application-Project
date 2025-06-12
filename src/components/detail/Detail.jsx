
// import './detail.css'
// const detail = () => {
//   return (
//     <div className='detail'>

// <div className="user">
//   <img src="avatar.png" alt="" />
//   <h2>John lee</h2>
//   <p>This is heck of a guy.</p>
// </div>





// <div className="info">
//   <div className="option">
//   <div className="title">
//     <span>Chat setting</span>
//     <img src="arrowUp.png" alt="" />
//   </div>
//   </div>
//   <div className="option">
//   <div className="title">
//     <span>Chat setti</span>
//     <img src="arrowUp.png" alt="" />
//   </div>
//   </div>
//   <div className="option">
//   <div className="title">
//     <span>Privacy & Help</span>
//     <img src="arrowUp.png" alt="" />
//   </div>
//   </div> 
//    <div className="option">
//   <div className="title">
//     <span>Shared Photos</span>
//     <img src="arrowDown.png" alt="" />
//   </div>
//   <div className="photos">
//     <div className="photoitem">
//       <div className="photodetail">
//       <img src="Screenshot from 2025-06-12 07-36-58.png" alt="" />
//       <span>Img-5413</span>
//       </div>
//     </div>
//     <div className="photoitem">
//       <div className="photodetail">
//       <img src="Screenshot from 2025-06-12 07-36-58.png" alt="" />
//       <span>Img-5413</span>
//       </div>
//     </div>
//     <div className="photoitem">
//       <div className="photodetail">
//       <img src="Screenshot from 2025-06-12 07-36-58.png" alt="" />
//       <span>Img-5413</span>
//       </div>
//     </div>
//     <div className="photoitem">
//       <div className="photodetail">
//       <img src="Screenshot from 2025-06-12 07-36-58.png" alt="" />
//       <span>Img-5413</span>
//       </div>
//     </div>
//     <img src="download.png" alt="" />
//   </div>
//   </div>

//   <div className="option">
//   <div className="title">
//     <span>Shared Files</span>
//     <img src="arrowUp.png" alt="" />
//   </div>
//   </div>
//   <button>Block user</button>
// </div>



//       Detail
//     </div>
//   )
// }

// export default detail



import './detail.css'

const Detail = () => {
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
        <button className='logout'>Logout</button>
      </div>
    </div>
  )
}


export default Detail;