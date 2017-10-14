import React, {Component} from 'react';

class Style extends Component {
    render() {
        let content = '\n';

        for (let [selector, rules] of Object.entries(this.props.rules)) {
            content += `${selector}{`;

            for (let [key, val] of Object.entries(rules)) {
                content += `${key}: ${val};`
            }

            content += '}\n';
        }

        return <style>{content}</style>;
    }
}

export default Style;
