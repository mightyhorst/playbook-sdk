# 💅 UIKit

1. Atomic design
2. Compound Components vs Config
3. Decouple Logic into UIKit + LogicKit 

## 1. Atomic Design

Popularised by Brad frost

[https://bradfrost.com/blog/post/atomic-web-design/](https://bradfrost.com/blog/post/atomic-web-design/)

![https://bradfrost.com/wp-content/uploads/2013/06/atomic-design.png](https://bradfrost.com/wp-content/uploads/2013/06/atomic-design.png)

| Atomic Design | UIKit           | Examples                     |
| --- | --- | --- |
| `Pages`       | `01. Portals`   | Pages, Modals                |
| `Organisms`   | `02. Layouts`   | Journey, Tabs, Standard                |
| `Molecules`   | `03. Compounds` | Forms, Wells, Tables                  |
| `Atoms`       | `04. Elements`  | GEL Generic, React Bootstrap |

## 2. Compound Components vs Config

### Problems with Config pattern:
* jQuery vs React - house on the cliff analogy 
* Callbacks: state doesnt work, need to use refs (imperative vs declarative - no pub/sub)


##### 2.1. Config Example 
```js

// 😭 "Config" pattern - not this
const tabs = [
  {
    id: 1,
    title: 'Home Tab',
    onClick: () => {
      
    }
  },
  {
    id: 2,
    title: 'Search Tab'
  }
];
<Tabs tabs={tabs}>

```


##### 2.2. Compound Components Example 
```js

const [activeTab, setActiveTab] = useState(); 

//  🤑  "Compund compounents" pattern - yes!
<Tabs>
  <TabNav>
    <Tab tabId={1} onAction={tabAction}>
        Home Tab
    </Tab>
  </TabNav>
  <TabContent>
      <TabPane tabId={1}>
          Body of the Tab
      </TabPane>
  </TabContent>
</Tabs>

```

React is already declarative. That means that the JSX under the hood is turned into a JSON object ('fiber') and rebuilt in the virtual dom before dommiting to the HTML dom. 

# 3. Decouple Logic: UIKit only for styles and conditional rendering
Logic has been decoupled and organised into a LogicKit (in the next category).

UI should only be used for: 
* styles and branding 
* conditional rendering: passing in props ect to toggle classes or conditionally render elements 

The LogicKit is used in conjunction with the UIKit to add everything else: 
* State Management 
* Form validation 
* API integration
* Authn/Authz
* Auth Guards with Functional Groups 
* Routing 

